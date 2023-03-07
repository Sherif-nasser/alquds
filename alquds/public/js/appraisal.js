frappe.ui.form.on('Appraisal', {
  
    before_save(frm,cdt,cdn){
        var d = locals[cdt][cdn];
        // console.log("sherif");
        // console.log(frm.doc.employee_name);
        // console.log(frm.doc.name);
        if(frm.doc.employee_name){
            frappe.call({
                async: false,
                method: "alquds.alqudsQueries.update_absent",
                args: {
                    Employee: frm.doc.employee_name,
                    docname:frm.doc.name
                },
                callback: function(r) { 
                    console.log(r.message);
                },
            });
        }
         
        
        if(d.total_score && d.components_total_score){
            let overallscore =  (d.total_score * 0.75) + (d.components_total_score * 0.25);
            frm.set_value("overall_score",overallscore);
        }
        
    }
    
    
});

