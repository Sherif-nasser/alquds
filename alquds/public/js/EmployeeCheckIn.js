frappe.ui.form.on('Employee Checkin', {
  
    after_save(frm) {
        // frappe.call({
     //     method: "frappe.client.get_list",
     //     args: {
     //         doctype: 'Shift Type', 
     //         fields : ['over_time_after','late_penalty_after','start_time','end_time','deduction_rate',
     //         'rate','round','deduction_round','round_time','deduction_round_time','component','deduction_component'
     //         ]
     //     },
     //     callback(r) {
     //         if(r.message) {
     //             let shift = frm.doc.shift;
     //             // console.log("shift : " + shift);
     //             // shift_type(shift);
     //             let fields = r.message;
     //             let log_type = frm.doc.log_type;
                 
     //             shift_type(shift).then(resp => {
     //     	                   console.log('end_time  = ', resp.message);
                              
     //     	                });
                 
 
     //             for(let field of fields){
     //                 console.log("field.start_time : "+ frm.doc.shift_actual_start.split(" ")[1]);
                     
     //                 let component =field.component;
     //                 let employee = frm.doc.employee;
                 
     //                 if(log_type == "IN"){
     //                     // frm.set_value("overtime", '');
     //                     let date_day = frm.doc.creation.split(" ")[0];
     //                     let late_penalty_after = field.late_penalty_after;  // frm.doc.shift_actual_start.split(" ")[1]
     //                     // let late_penalty_after = frm.doc.shift_actual_start.split(" ")[1];
     //                     let time_of_login = frm.doc.creation;
     //                     let payroll_date = frm.doc.creation.split(" ")[0];
 
     //                     // console.log(time_of_login.split(" ")[1]);
     //                         if(parseFloat(time_of_login.split(" ")[1]) > parseFloat(late_penalty_after)){
     //                             let rate = field.deduction_rate;
     //                             let round = field.deduction_round;
     //                             let round_time = field.deduction_round_time;
     //                             if(round){
     //                                 // console.log('round is true');
     //                                 // calculate_overtime_or_deduction_with_rate_for_round
     //                                 // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                                 let late_time = calculate_overtime_or_deduction_with_rate_for_round(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate,round_time);
     //                                 console.log(late_time);
     //                                 let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                                 frm.set_value("deduction",x );
     //                                 // let component =field.component;
     //                                 // let employee = frm.doc.employee;
     //                                 // let payroll_date = frm.doc.modified.split(" ")[0];
     //                                 additional_salary(employee,component,late_time,payroll_date);
     //                             }
     //                             else{
     //                                 // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                                 let late_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate);
     //                                 console.log(late_time);
     //                                 let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                                 frm.set_value("deduction",x );
     //                                 additional_salary(employee,component,late_time,payroll_date);
                                     
     //                                 // let payroll_date = frm.doc.modified.split(" ")[0];
                                    
     //                             }
     //                             // console.log(late_time);
                             
                               
     //                         }
     //                 }
     //                 if(log_type == "OUT"){
     //                     frm.set_value("deduction", '');
     //                     let date_day = frm.doc.creation.split(" ")[0];
     //                     let time_of_logout = frm.doc.creation;
     //                     let over_time_after = field.over_time_after; // cur_frm.doc.shift_actual_end.split(" ")[1]
     //                     // let over_time_after = frm.doc.shift_actual_end.split(" ")[1];
     //                     let payroll_date = frm.doc.creation.split(" ")[0];
 
     //                     // console.log(date_day);
                         
     //                         if(parseFloat(time_of_logout.split(" ")[1]) > parseFloat(over_time_after)){
     //                             // console.log('overtime')
     //                             let rate = field.rate;
     //                             let round = field.round;
     //                             let round_time = field.round_time;
                                 
     //                             if(round){
     //                                 // console.log('deduction round is true');
     //                                 // calculate_overtime_or_deduction_with_rate_for_round
     //                                 let over_time = calculate_overtime_or_deduction_with_rate_for_round(new Date(time_of_logout), new Date(date_day + " " + over_time_after),rate,round_time);
     //                                 // let over_time = timeDiffCalc(new Date(time_of_logout), new Date(date_day + " " + over_time_after));
                                     
     //                                 frm.set_value("overtime", over_time );
                                     
     //                                 // let component =field.component;
     //                                 // let employee = frm.doc.employee;
                                     
     //                                 additional_salary(employee,component,over_time,payroll_date);
 
     //                             }
     //                             else{
     //                                 let over_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_logout), new Date(date_day + " " + over_time_after),rate);
     //                                 // let over_time = timeDiffCalc(new Date(time_of_logout), new Date(date_day + " " + over_time_after));
     //                                 frm.set_value("overtime", over_time );
                                     
     //                                 // let component =field.component;
     //                                 // let employee = frm.doc.employee;
                                     
     //                                 additional_salary(employee,component,over_time,payroll_date);
     //                             }
     //                         }
                           
     //                 }
                     
                     
                     
                     
     //             }
     //         }
     //     }
     // });
         let log_type = frm.doc.log_type;
        //  console.log("sherif" + log_type)
         
         let shift = frm.doc.shift;
        //  console.log(shift)
         let employee = frm.doc.employee;
         // let test = shift_type(shift).then(resp => {
         // 	               //   resp.message.end_time;
         // 	               return resp.message.end_time;
         // 	                });
         if(log_type == "IN"){
             shift_type(shift).then((message) => {
                 let component =message.message.deduction_component;
                 console.log(component);
                 console.log("sherryy");
                 // console.log(message.message.late_penalty_after);
                 // message.message.late_penalty_after;
                 // frm.set_value("deduction", message.message.late_penalty_after );
                 let date_day = frm.doc.creation.split(" ")[0];
                 let late_penalty_after = message.message.late_penalty_after;  // frm.doc.shift_actual_start.split(" ")[1]
                 // let late_penalty_after = frm.doc.shift_actual_start.split(" ")[1];
                 let time_of_login = frm.doc.creation;
                 
                 let payroll_date = frm.doc.creation.split(" ")[0];

                
                 
                 if(parseFloat(time_of_login.split(" ")[1]) > parseFloat(late_penalty_after)){
                     let rate = message.message.deduction_rate;
                     let round = message.message.deduction_round;
                     let round_time = message.message.deduction_round_time;
                     
                     if(round){
                         // console.log('round is true');
                         // calculate_overtime_or_deduction_with_rate_for_round
                         // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
                         let late_time = calculate_overtime_or_deduction_with_rate_for_round(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate,round_time);
                         
                         let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
                         console.log(x + ' x');
                         frm.set_value("deduction",x );
                         // let component =field.component;
                         // let employee = frm.doc.employee;
                         // let payroll_date = frm.doc.modified.split(" ")[0];
                         additional_salary(employee,component,late_time,payroll_date);
                     }
                     else{
                        console.log("from else");
                         // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
                         console.log(new Date(time_of_login));
                         console.log(time_of_login + " time_of_login");
                         console.log(new Date(date_day + " " + late_penalty_after));
                         console.log(date_day + " date_day");
                         console.log(late_penalty_after + " late_penalty_after");
                         console.log(rate);
                         let late_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate);
                         console.log(late_time + " late_time");
                         let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
                         frm.set_value("deduction",x );
                         additional_salary(employee,component,late_time,payroll_date);
                         
                         // let payroll_date = frm.doc.modified.split(" ")[0];
                        
                     }
                     // console.log(late_time);
                 
                   
                 }
 
                 
             });
         }
         
         if(log_type == "OUT"){
             shift_type(shift).then((message) => {
                     let component =message.message.component;
                     frm.set_value("deduction", '');
                     let date_day = frm.doc.creation.split(" ")[0];
                     let time_of_logout = frm.doc.creation;
                     let over_time_after = message.message.over_time_after; // cur_frm.doc.shift_actual_end.split(" ")[1]
                     // let over_time_after = frm.doc.shift_actual_end.split(" ")[1];
                     let payroll_date = frm.doc.creation.split(" ")[0];
                     
                         if(parseFloat(time_of_logout.split(" ")[1]) > parseFloat(over_time_after)){
                             // console.log('overtime')
                             let rate = message.message.rate;
                             let round = message.message.round;
                             let round_time = message.message.round_time;
                             
                             if(round){
                                 // console.log('deduction round is true');
                                 // calculate_overtime_or_deduction_with_rate_for_round
                                

                                 let over_time = calculate_overtime_or_deduction_with_rate_for_round(new Date(time_of_logout), new Date(date_day + " " + over_time_after),rate,round_time);
                                 // let over_time = timeDiffCalc(new Date(time_of_logout), new Date(date_day + " " + over_time_after));
                                 
                                 frm.set_value("overtime", over_time );
                                 
                                 // let component =field.component;
                                 // let employee = frm.doc.employee;
                                 
                                 additional_salary(employee,component,over_time,payroll_date);
         
                             }
                             else{
                                 let over_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_logout), new Date(date_day + " " + over_time_after),rate);
                                 // let over_time = timeDiffCalc(new Date(time_of_logout), new Date(date_day + " " + over_time_after));
                                 frm.set_value("overtime", over_time );
                                 
                                 // let component =field.component;
                                 // let employee = frm.doc.employee;
                                 
                                 additional_salary(employee,component,over_time,payroll_date);
                             }
                         }
               
         
             });
             }
         
         
         
     //     if(log_type == "IN"){
     //     // frm.set_value("overtime", '');
     //     let date_day = frm.doc.creation.split(" ")[0];
     //     let late_penalty_after = field.late_penalty_after;  // frm.doc.shift_actual_start.split(" ")[1]
     //     // let late_penalty_after = frm.doc.shift_actual_start.split(" ")[1];
     //     let time_of_login = frm.doc.creation;
     //     let payroll_date = frm.doc.creation.split(" ")[0];
 
     //     // console.log(time_of_login.split(" ")[1]);
     //         if(parseFloat(time_of_login.split(" ")[1]) > parseFloat(late_penalty_after)){
     //             let rate = field.deduction_rate;
     //             let round = field.deduction_round;
     //             let round_time = field.deduction_round_time;
                 
     //             if(round){
     //                 // console.log('round is true');
     //                 // calculate_overtime_or_deduction_with_rate_for_round
     //                 // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                 let late_time = calculate_overtime_or_deduction_with_rate_for_round(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate,round_time);
     //                 console.log(late_time);
     //                 let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                 frm.set_value("deduction",x );
     //                 // let component =field.component;
     //                 // let employee = frm.doc.employee;
     //                 // let payroll_date = frm.doc.modified.split(" ")[0];
     //                 additional_salary(employee,component,late_time,payroll_date);
     //             }
     //             else{
     //                 // let late_time = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                 let late_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_login), new Date(date_day + " " + late_penalty_after),rate);
     //                 console.log(late_time);
     //                 let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));
     //                 frm.set_value("deduction",x );
     //                 additional_salary(employee,component,late_time,payroll_date);
                     
     //                 // let payroll_date = frm.doc.modified.split(" ")[0];
                    
     //             }
     //             // console.log(late_time);
             
               
     //         }
     // }
 
         
     },
     
 });
 
 
 function timeDiffCalc(dateFuture, dateNow) {
     let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
     const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
     diffInMilliSeconds -= hours * 3600;
     // console.log('calculated hours', hours);
 
     // calculate minutes
     const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
     diffInMilliSeconds -= minutes * 60;
     // console.log('minutes', minutes);
 
     let difference = '';
    
     difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;
 
     difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`; 
     return difference;
   }
   
   
   function calculate_overtime_or_deduction_with_rate_for_ordinary(dateFuture, dateNow ,rate){
     let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
 
     // calculate hours
     let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
     diffInMilliSeconds -= hours * 3600;
     // console.log('calculated hours', hours);
 
     // calculate minutes
     let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
     diffInMilliSeconds -= minutes * 60;
     // console.log('minutes', minutes);
     
     if(minutes > 30){
         hours ++;
         // console.log("hours when min > 30:" + hours);
         // console.log("rate*hours :  " + rate*hours);
         return rate*hours;
     }
     else{
         // console.log("rate*hours :  " + rate*hours);
         return rate*hours;
     }
     // return minutes;
   }
   
   function calculate_overtime_or_deduction_with_rate_for_round(dateFuture, dateNow ,rate, round_time){
    console.log(dateFuture)
    console.log(dateNow)
    console.log(rate)
    console.log(round_time)

     let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
 
     // calculate hours
     let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
     diffInMilliSeconds -= hours * 3600;
     // console.log('calculated hours', hours);
     
     // calculate minutes
     let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
     diffInMilliSeconds -= minutes * 60;
     // console.log('minutes : ', minutes);
     // console.log("round_time : " + round_time);
     
     if( minutes >= 10 && minutes < 20 ){
         return round_time_15(hours,rate);        
     }
     
     else if (minutes >= 20 && minutes < 50){
         return round_time_30(hours,rate);
     }
     else if (minutes >= 50 && minutes <= 60 ){
         return round_time_60(hours,rate);
     }
     
     else{
         // console.log("hours  : " + hours);
         return rate*hours; 
     }
     
     // console.log("(hours+round)*rate : " + (hours + round)*rate);
   }
   
   
   function round_time_15(hours,rate){
     //   console.log("(hours+0.25)*rate " + ((hours+0.25)*rate));
       return (hours+0.25)*rate;
   }
   
   function round_time_30(hours,rate){
     //   console.log("(hours+0.25)*rate " + ((hours+0.5)*rate));
       return (hours+0.5)*rate;
   }
   
   function round_time_60(hours,rate){
       hours ++;
     //   console.log(hours);
     //   console.log("(hours+0.25)*rate " +hours*rate);
       return hours*rate;
   }
   
   function additional_salary(employee,component,late_time_or_overtime,payroll_date){
     let log = frappe.model.get_new_doc("Additional Salary");
     //  console.log("additional salary name " + log.add_salary_name);
     log.employee = employee;
     log.salary_component = component;
     log.amount = late_time_or_overtime;
     log.payroll_date = payroll_date;
     frappe.db.insert(log);
  }
  
  function shift_type(name){
     return frappe.call({
         method: 'frappe.client.get',
         args:{
             doctype: 'Shift Type', 
             name: name
         // fields : ['over_time_after','late_penalty_after','start_time','end_time','deduction_rate',
             // 'rate','round','deduction_round','round_time','deduction_round_time','component','deduction_component'],
             // filters:{
             //     'name':name
             // }
         }
     });
 }