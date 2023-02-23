// variables to export {}


frappe.ui.form.on('Employee Checkin', {
    onload(frm) {
        // check_additionalsalary_history_punishment();
        // check_additionalsalary_history_lateness();
        console.log(frm.doc.employee)
        // testOverTime()

    },
    before_save(frm){
        console.log(frm.doc.shift);
    },

    after_save(frm) {
        let log_type = frm.doc.log_type;
        let shift = frm.doc.shift;
        console.log(shift)
        let employee = frm.doc.employee;

        if (log_type == "IN") {
            shift_type(shift).then((message) => {
                let component = message.message.deduction_component;
                let LateEntryGracePeriod = message.message.late_entry_grace_period;
                let PenaletyComponent = message.message.penalty_component
                let ShiftStartTime = message.message.start_time;
                let ShiftEndTime = message.message.end_time;
                console.log(ShiftStartTime + 'ShiftStartTime');
                console.log(ShiftEndTime + 'ShiftEndTime');

                let date_day = frm.doc.creation.split(" ")[0];
                let late_penalty_after = message.message.late_penalty_after; // frm.doc.shift_actual_start.split(" ")[1]
                let time_of_login = frm.doc.creation;
                let payroll_date = frm.doc.creation.split(" ")[0];


                if (parseFloat(time_of_login.split(" ")[1]) > parseFloat(late_penalty_after)) {
                    let rate = message.message.deduction_rate;
                    let round = message.message.deduction_round;
                    let round_time = message.message.deduction_round_time;

                   
                    console.log("from else");
                    console.log('round is false');

                    let late_time = calculate_overtime_or_deduction_with_rate_for_ordinary(new Date(time_of_login), new Date(date_day + " " + late_penalty_after), rate, LateEntryGracePeriod);
                    //  console.log(late_time + " late_time");
                    //  let x = timeDiffCalc(new Date(time_of_login), new Date(date_day + " " + late_penalty_after));

                    frm.set_value("deduction", late_time);
                    //  frm.refresh_field("deduction");
                    let first_or_second = check_additionalsalary_history_punishment(employee, PenaletyComponent);
                    let quarter_day_deduction = calculate_quarter_day(new Date(date_day + " " + ShiftStartTime), new Date(date_day + " " + ShiftEndTime));
                    let half_deduction_date = calculate_half_day(new Date(date_day + " " + ShiftStartTime), new Date(date_day + " " + ShiftEndTime));
                    let first_time_late = check_additionalsalary_history_lateness(employee, component);

                    console.log(first_time_late);
                    console.log(first_or_second);

                    if (first_time_late && first_or_second == 0) {
                        additional_salary(employee, PenaletyComponent, quarter_day_deduction, payroll_date);
                        console.log("after first time late");
                    }
                    if (first_or_second && first_or_second == 1) {
                        additional_salary(employee, PenaletyComponent, quarter_day_deduction, payroll_date);
                        console.log("calculate_quarter_day");
                    }

                    if (first_or_second && first_or_second == 2) {
                        additional_salary(employee, PenaletyComponent, half_deduction_date, payroll_date);
                        console.log("calculate_half_day");
                    }
                    additional_salary(employee, component, late_time, payroll_date);

                    update_appraisal_HR_Factor(employee);

                    

                }


            });
        }

        if (log_type == "OUT") {
            shift_type(shift).then((message) => {

                let OvertimeComponent = message.message.component;
                console.log('OvertimeComponent ' + OvertimeComponent);
                frm.set_value("deduction", '');
                let date_day = frm.doc.creation.split(" ")[0];
                let time_of_logout = frm.doc.creation;
                let over_time_after = message.message.over_time_after; // cur_frm.doc.shift_actual_end.split(" ")[1]
                let payroll_date = frm.doc.creation.split(" ")[0];
                let rate = message.message.rate;
                console.log(over_time_after);
                console.log("should be greater "+time_of_logout);
                console.log(parseFloat(time_of_logout.split(" ")[1]) + " Greater than")
                console.log(parseFloat(over_time_after) + " Less than")

                if (parseFloat(time_of_logout.split(" ")[1]) > parseFloat(over_time_after)) {
                    console.log(' TRUUUUUE');
                    let rate = message.message.rate;
                    let round = message.message.round;
                    let round_time = message.message.round_time;
                    console.log("no round marked method calculate_overtime_or_deduction_with_rate_no_round");
                    let over_time = calculate_overtime_or_deduction_with_rate_no_round(new Date(time_of_logout), new Date(date_day + " " + over_time_after), rate);
                    frm.set_value("overtime", over_time);
                
                    additional_salary(employee, OvertimeComponent, over_time, payroll_date);
                    
                }
                if(parseFloat(time_of_logout.split(" ")[1]) === parseFloat(over_time_after)){
                    console.log(parseFloat(time_of_logout.split(" ")[1])+ '===' +parseFloat(over_time_after))
                    try{
                        let over_time = calculate_overtime_or_deduction_with_rate_no_round(new Date(time_of_logout), new Date(date_day + " " + over_time_after), rate)
                        frm.set_value("overtime", over_time);
                        additional_salary(employee, OvertimeComponent, over_time, payroll_date);

                    }catch(e){
                        console.log(e.message);
                    }
                    
                }
            });
        }

    },

});

function update_appraisal_HR_Factor(employee){
    frappe.call({
        async: false,
        method: "alquds.alqudsQueries.update_appraisal_factor",
        args: {
            EmployeeName: employee,
        },
        callback: function(r) { 
            console.log(r.message);
        },
    });
}

// function timeDiffCalc(dateFuture, dateNow) {
//     let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
//     const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
//     diffInMilliSeconds -= hours * 3600;
//     // console.log('calculated hours', hours);

//     // calculate minutes
//     const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
//     diffInMilliSeconds -= minutes * 60;
//     // console.log('minutes', minutes);

//     let difference = '';

//     difference += (hours === 0 || hours === 1) ? `${hours} hour, ` : `${hours} hours, `;

//     difference += (minutes === 0 || hours === 1) ? `${minutes} minutes` : `${minutes} minutes`;
//     return difference;
// }


function calculate_overtime_or_deduction_with_rate_for_ordinary(dateFuture, dateNow, rate, grace_period) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;



    let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    let total_minutes = (hours * 60) + minutes
    console.log(hours);

    console.log(total_minutes + " total_minutes");
    if (grace_period) {
        total_minutes -= grace_period;
    }
    total_minutes = total_minutes * rate
    return total_minutes;
}

// function calculate_overtime_or_deduction_with_rate_for_round(dateFuture, dateNow, rate, round_time) {


//     let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

//     // calculate hours
//     let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
//     diffInMilliSeconds -= hours * 3600;
//     // console.log('calculated hours', hours);

//     // calculate minutes
//     let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
//     diffInMilliSeconds -= minutes * 60;
//     console.log('minutes : ', minutes);
//     console.log("round_time : " + round_time);
//     console.log("hours : " + hours);
//     console.log(hours + 0.25);
    
//     if (minutes > round_time) {
//         hours = hours + 1;
//         console.log('minutes more than 30 : ' + hours);
//     }
    
    
//     let total_minutes = (hours * 60) + minutes;
//     console.log('calculate_overtime_or_deduction_with_rate_for_round '+ total_minutes);
//     total_minutes = total_minutes * rate
//     console.log('calculate_overtime_or_deduction_with_rate_for_round '+ total_minutes);
//     return total_minutes
// }


function calculate_overtime_or_deduction_with_rate_no_round(dateFuture, dateNow, rate) {

    console.log(dateFuture);
    console.log(dateNow);

    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
    console.log(diffInMilliSeconds)
    // calculate hours
    let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;
    // console.log('calculated hours', hours);

    // calculate minutes
    let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;
    console.log('minutes : ', minutes);
    // console.log("round_time : " + round_time);
    console.log("hours : " + hours);
    let total_minutes = (hours * 60) + minutes;
    // console.log(total_minutes* rate + ' total minutes');
    console.log(total_minutes + " total minutes");

    let numberOfminutes = Math.floor(total_minutes / 30);
    console.log(numberOfminutes + ' numberOfminutes 30 minutes in total minutes');

    if(numberOfminutes != 0){
        let overTimeInMinutes = (Math.sign(numberOfminutes) == 1) ? 1 : 0

        if(overTimeInMinutes){
            total_minutes = numberOfminutes * 30;
            console.log("after calculating 30 imnutes "+ total_minutes);
        }else{
            console.log("No overtime calculated");
        }
    }
 
    total_minutes = total_minutes * rate
    console.log( "total minutes after the rate " + total_minutes)
    return total_minutes
}

function additional_salary(employee, component, late_time_or_overtime, payroll_date) {

    let log = frappe.model.get_new_doc("Additional Salary");
    log.employee = employee;
    log.salary_component = component;
    log.amount = late_time_or_overtime;
    log.payroll_date = payroll_date;
    frappe.db.insert(log);

}



function calculate_quarter_day(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let total_minutes = (hours * 60) + minutes

    total_minutes = total_minutes / 4;
    return total_minutes;

}

function calculate_half_day(dateFuture, dateNow) {
    let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;

    let hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    let minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let total_minutes = (hours * 60) + minutes

    total_minutes = total_minutes / 2;
    return total_minutes;
}

function check_additionalsalary_history_punishment(employee, PenaletyComponent) {
    let check = 0;
    if (employee && PenaletyComponent) {
        frappe.call({
            async: false,
            method: "alquds.alqudsQueries.get_additional_salaries_punishment",
            args: {
                EmployeeName: employee,
                comp: PenaletyComponent
            },
            callback: function(r) {
                let allAdditional = r.message;

                console.log(allAdditional);
                if (allAdditional.length > 0) {

                    if (allAdditional.length % 2 != 0) {
                        check = 2;
                        console.log("odd");
                        console.log(allAdditional);
                    } else {
                        check = 1;
                        console.log("even");
                    }
                }

            },
        });
    }
    return check;
}

function shift_type(name) {
    return frappe.call({
        method: 'frappe.client.get',
        args: {
            doctype: 'Shift Type',
            name: name

            // fields : ['over_time_after','late_penalty_after','start_time','end_time','deduction_rate',
            // 'rate','round','deduction_round','round_time','deduction_round_time','component','deduction_component'],

        },
        callback(r) {
            console.log(r.message);
        }
    });
}


function check_additionalsalary_history_lateness(employee, component) {
    let checkFirstTime = 0;
    if (employee && component) {
        frappe.call({
            async: false,
            method: "alquds.alqudsQueries.get_additional_salaries_history",
            args: {
                EmployeeName: employee,
                comp: component
            },
            callback: function(r) {
                let allAdditionalLateness = r.message;
                // console.log(allAdditionalLateness);
                // console.log(allAdditionalLateness);
                // console.log('allAdditionalLateness length: '+ allAdditionalLateness.length);
                if (allAdditionalLateness.length >= 1) {
                    console.log("there is more thatn one lateness");
                    checkFirstTime = 1;
                }

            },
        });
    }

    return checkFirstTime
}