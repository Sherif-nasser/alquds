// frappe.ui.form.on('Additional Salary', {
//   //on_submit
//     refresh(frm) {
//         // write setup code
       
//         frappe.call({
//     	        method: 'frappe.client.get',
//     	        args: {
//     	            doctype: 'Appraisal' // Appraisal
//     	        },
//     	        callback: function(r) {
//     	            console.log(r.message);
//     	        }
    	        
    
// 	    });
//     }
// });
// frappe.model.with_doctype("Appraisal", function() {
//   let doc = frappe.model.get_new_doc("Additional Salary");
//   //console.log(doc); //  hr_appraisal_on_submit
//   frappe.db.insert('components');
  
//   //let add_salary = frm.docs;
// //   let add_salary = frm.docs[0].fields[24].fieldname;
  
//   //let add_sal = add_salary[0].fields[24].fieldname;
//   //console.log(add_salary);
  

// //let doc.hr_appraisal_on_submit = frm.hr_appraisal_on_submit;
  
// //   frappe.set_route("Form", "Additional Salary", doc.name);
// });


frappe.ui.form.on('Appraisal', {
    
    start_date(frm) {
        // write setup code
        //console.log('start date');
        if (frm.doc.employee === undefined) {
            frappe.validated = false;
        }
        else{
        frm.trigger('employee');
        }
   
    },
    end_date(frm) {
        //frm.trigger('employee');
        if (frm.doc.employee === undefined) {
            frappe.validated = false;
        }
        else{
        frm.trigger('employee');
        }
      
    },
    on_save(){
        console.log("Saved");
    },
    employee(frm) {
        //console.log(frm);
        if (frm.doc.end_date === undefined) {
            frappe.validated = false;
        }
        else if(frm.doc.start_date === undefined){
            //frappe.msgprint(__("You should select Dates"));
            frappe.validated = false;
            
        }
        else{
        //console.log("employee");
            frm.set_df_property("technical_appraisal", "hidden", 1);
            console.log('hidden ');
          
            frappe.call({
    	        method: 'frappe.client.get',
    	        args: {
    	            doctype: 'Appraisal Setting'
    	        },
    	        callback: function(r) {
    	            //console.log(r.message.reflected_payroll);
    	            if(r.message.reflected_payroll){
    	                frm.set_df_property("technical_appraisal", "hidden", 0);
        	            frm.doc.components = [];
        	            let per_of_hr_appraisal = r.message.per_of_hr_appraisal;
        
        	            
                        console.log(r.message.per_of_hr_appraisal);
                        
                        frm.fields_dict.components_total_score.set_label('Components Total Score out of ('+per_of_hr_appraisal+')');
                        
        	            if(r.message.late) {
        	               count_late(frm.doc.employee, frm.doc.start_date, frm.doc.end_date)
        	               .then(resp => {
        	                   //console.log('late = ', resp.message);
        	                   frm.add_child('components', {
        	                   'type': 'Late',
        	                   'value': parseInt(resp.message)
        	                });
        	                refresh_field('components');
        	               });
           	            }
           	            if(r.message.absence){
               	                //console.log(r.message.absence);
                   	            count_absence_filtered(frm.doc.employee, frm.doc.start_date, frm.doc.end_date)
                   	            .then(resp =>
                           	            {
                    	                   frm.add_child('components', {
                    	                   'type': 'absence',
                    	                   'value': resp.message
                    	                });
                    	                refresh_field('components');
                    	           });
           	            
           	            if(r.message.components.length > 0) {
           	               
           	                for(let comp of r.message.components) {
           	                    
           	                    additional_salary_calcualted(frm.doc.empolyee, comp.component)
           	                    .then(resp =>
           	                        {
           	                            frm.add_child('components',
           	                            {
           	                                'type':comp.component,
           	                                'value': resp.message
           	                            }
           	                        );
           	                            refresh_field('components');
           	                        });
           	                    
           	                }
           	            }
           	             
        	        }
    	            }
    	            else{
    	                console.log('here');
    	                frm.set_df_property("technical_appraisal", "hidden", 1);
    	            }
    	            
    	        }
    	        
    
    	    });
            
           
       }
	    
        
    },
    // on_submit
    on_submit(frm){
         
         
         frappe.call({
                method: 'frappe.client.get',
                args: {
                    'doctype': 'Appraisal Setting'
                   
                },
                callback: function(r) {
                 
                    //console.log(log);
                    let log = frappe.model.get_new_doc("Additional Salary");
                    //  console.log(log);
                    //  console.log("additional salary name " + log.add_salary_name);
                    log.employee = frm.doc.employee;
                    log.start_date = frm.doc.start_date;
                    log.end_date = frm.doc.end_date;
                    
                    let per_of_hr_appraisal = r.message.per_of_hr_appraisal;
                    // console.log("per_of_hr_appraisal : "+per_of_hr_appraisal);
                    let per_technical_Appraisal = 100 - per_of_hr_appraisal;
                    
                    let total_score = frm.doc.total_score;
                    
                    //console.log("per : "+ per_technical_Appraisal);
                    let value_of_total_score_after_per  = ((total_score * per_technical_Appraisal/5) * 100 )/ 100;
                    console.log("value_of_total_score_after_per: "+value_of_total_score_after_per);
                    
                    // console.log("frm.doc.components_total_score: "+ frm.doc.components_total_score);
                    let components_total_score = frm.doc.components_total_score;
                    let per_components_total_score = (components_total_score * 100)/100;
                    //console.log("per_components_total_score : "+per_components_total_score);
                    log.amount = parseFloat(per_components_total_score) + parseFloat(value_of_total_score_after_per);
                    
                    frm.set_value("overall_score", log.amount);
                    
                    
                    log.salary_component = r.message.default_component;
                    log.payroll_date = frm.doc.modified.split(' ')[0];
                    frappe.db.insert(log);
                        
                }
            });
         
        
        //  console.log(log);
        
         
  
    }
    
    
}
    
    
);

frappe.ui.form.on('Appraisal', {
      /*  
	//employee: function(frm) {
	    
	    frappe.call({
	        method: 'frappe.client.get',
	        args: {
	            doctype: 'Appraisal Setting'
	        },
	        callback: function(r) {
	            frm.doc.components = [];
	            let per_of_hr_appraisal = r.message.per_of_hr_appraisal;

	            
                console.log(r.message.per_of_hr_appraisal);
                
                frm.fields_dict.components_total_score.set_label('Components Total Score out of ('+per_of_hr_appraisal+')');
                
	            if(r.message.late) {
	               count_late(frm.doc.employee, frm.doc.start_date, frm.doc.end_date)
	               .then(resp => {
	                   //console.log('late = ', resp.message);
	                   frm.add_child('components', {
	                   'type': 'Late',
	                   'value': parseInt(resp.message)
	                });
	                refresh_field('components');
	               });
   	            }
   	            if(r.message.absence){
       	                //console.log(r.message.absence);
           	            count_absence_filtered(frm.doc.employee, frm.doc.start_date, frm.doc.end_date)
           	            .then(resp =>
                   	            {
            	                   frm.add_child('components', {
            	                   'type': 'absence',
            	                   'value': resp.message
            	                });
            	                refresh_field('components');
            	           });
   	            
   	            if(r.message.components.length > 0) {
   	               
   	                for(let comp of r.message.components) {
   	                    
   	                    additional_salary_calcualted(frm.doc.empolyee, comp.component)
   	                    .then(resp =>
   	                        {
   	                            frm.add_child('components',
   	                            {
   	                                'type':comp.component,
   	                                'value': resp.message
   	                            }
   	                        );
   	                            refresh_field('components');
   	                        });
   	                    
   	                }
   	            }
   	             
	        }}

	    });
	},*/
	
	before_save(frm) {
	    frappe.call({
	        method: 'frappe.client.get',
	        args: {
	            doctype: 'Appraisal Setting'
	        },
	        async: false,
	        callback: function(r) {

	            let per_of_hr_appraisal = r.message.per_of_hr_appraisal;

	            
                console.log(r.message.per_of_hr_appraisal);
                let total = 0;
                for(let values of frm.doc.components){
                    //console.log(value.value);
                    total += values.value;
         
                }
                let hr_appraisal = Math.max(0, per_of_hr_appraisal - total);
                
                    // if(total >= per_of_hr_appraisal){
                    //     console.log('total >= 25');
                    //     hr_appraisal = 0;
                    // }
                    // else{
                    // hr_appraisal = per_of_hr_appraisal - total;
                    // }
                    //console.log(total);
                    frm.set_value("components_total_score", hr_appraisal);
	            }
	        
	    });
    },
   
   
//   Additional Salary
   
});

function count_late(employee, start_date, end_date) {
    return frappe.call({
        method: 'frappe.client.get_count',
        args: {
            doctype: 'Attendance',
            filters: {
                'employee': employee,
                'late_entry': 1,
                'attendance_date': (['<=', end_date], ['>=', start_date])
            }
        }
    });
}



function count_absence_filtered(employee,start_date, end_date) {
    return frappe.call({
        method: 'frappe.client.get_count',
        args: {
            doctype: 'Attendance',
            filters: {
                'employee': employee,
                'status': 'Absent',
                'attendance_date': (['<=', end_date], ['>=', start_date])
            }
            
        }
    });
}

function additional_salary_calcualted(employee, component){
    return frappe.call({
        method: 'frappe.client.get_count',
        args:{
            doctype: 'Additional Salary',
            filters:{
                'employee':employee,
                'salary_component' : component
            }
        }
        /*callback:function(r){
        }*/
    });
}