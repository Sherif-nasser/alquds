let exchange_rate_from_CM = 0;
frappe.ui.form.on('Bank Guarantee', {

onload:function(frm){
  
},
before_save:function(frm){
// let total_amount = frm.doc.total_amount;
let cover_amount = frm.doc.total_cover_money;
let commission  = frm.doc.commission;
let bank_account = frm.doc.bank_account;
let currencey = frm.doc.currency;

    
    // if(bank_account && frm.doc.payment_term == "Avalized"){
    //     frappe.call({
    //         method:"alquds.MurabhaController.Murabha.update_bank_account",
    //         args:{
    //             bank_account : bank_account,
    //             cover_amount : cover_amount
    //         },
    //         callback: function(r) {

    //         },
    //     })
    // }
    

    frm.set_value('currency', currencey);

    if(!frm.doc.docstatus){
    let total_cover = calculate_amount(frm, frm.doc.cover_money);
        frm.set_value('total_cover_money', total_cover);
        frm.set_value('amount_without_margin', total_cover);

        let total_com = calculate_amount(frm, frm.doc.commission);
        frm.set_value('total_commission', total_com);
        frm.set_value('margin_money', total_com);
        
        let total_amount = total_cover + total_com;
        if(total_amount > 0 ){
            frm.set_value('amount', total_amount);
            frm.set_value('total_amount', total_amount);
            frm.set_value("remaining", total_amount);
        }   
    }
    
}

})


frappe.ui.form.on('Document Payment', {

})



frappe.ui.form.on('Bank Guarantee', {
    refresh: function(frm) {
        
        if(frm.doc.docstatus) {
            handle_refresh(frm)
        }
         
    },
    after_save: function(frm) {
        let currencey = frm.doc.currency;
        frm.set_value('currency', currencey);
        if(frm.doc.docstatus) {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    'doctype': 'Bank Account Log',
                    'filters': {'bank_guarantee': frm.doc.name, 'type': 'payment'}
                },
                callback: function(r) {
                    async function del_doc(r) {
                        for(let log of r.message) {
                            await frappe.db.delete_doc("Bank Account Log", log.name);
                        }
                        // set_available(frm)
                        frm.reload_doc();
                    }
                    del_doc(r);
                }
            });
            async function insert_doc() {
                let log = '';
                for(let pay of frm.doc.payment) {
                    log = frappe.model.get_new_doc("Bank Account Log");
                    log.bank_guarantee = frm.doc.name;
                    log.bank_account = frm.doc.bank_account;
                    log.account_currency = frm.doc.bank_currency;
                    log.credit = pay.exchanged_amount;
                    log.type = 'payment';
                    log.other = pay.payment;
                    await frappe.db.insert(log);
                }
                // await set_available(frm)
                frm.reload_doc();
            }
            if(frm.doc.payment_term == "Avalized"){

                insert_doc();
            }
        }
    },
    onload: function(frm) {
        frm.set_currency_labels(['total_commission'], frm.doc.currency);
        frm.set_currency_labels(['total_cover_money'], frm.doc.currency);
        frm.set_currency_labels(['remaining'], frm.doc.currency);

	},
	before_submit: function(frm) {
        let currencey = frm.doc.currency;
        frm.set_value('currency', currencey);
        let payment_status = frm.doc.payment_status;
        
	    let exch = get_exchange(frm.doc.bank_currency, frm.doc.currencey);
	    console.log(frm.doc.currency);
	    let credit = exch * frm.doc.bank_available_amount;
	    
	    if(credit - frm.doc.amount < 0) {
	        frappe.throw("There is no enough credit in the bank");
	    }
        frm.set_value("payment_status",payment_status);
	},
	on_submit: function(frm) {
      
        if(frm.doc.payment_term == "Avalized" ){
            async function sumb(frm) {
                await insert_log(frm, 'debit', 'bank guarantee');
            // await set_available(frm);
                cur_dialog.hide();
            }
            sumb(frm);
        }
	},
	after_cancel: function(frm) {
	  let later_remove = [];
	  frm.doc.murabaha.forEach(mur => {
	      later_remove.push(mur.murabaha_name);
	        frappe.call({
	            'async': false,
	            'method': 'frappe.client.get_list',
                'args': {
                    'doctype': 'Bank Account Log',
                    'filters': {'murabaha': mur.murabaha_name},
                    'fields': ['name']
                },
                callback: function(r) {
                    r.message.forEach(log => frappe.db.delete_doc('Bank Account Log', log.name));
                }
    	   });
	    });
	  frm.set_value('murabaha', []);
	  later_remove.forEach(rec => {
	      frappe.db.set_value('Murabaha', rec, 'bank_guarantee', '');
	  });
	},
	get_available_credit: function(frm) {
        get_credit({'bank_account' : frm.doc.bank_account}).then(r => {
          console.log(r.message);
          let balance = sum_credit(r.message, frm.doc.bank_currency);
          frm.set_value('bank_available_amount', Math.min(frm.doc.bank_credit, frm.doc.bank_credit + balance));
        });
	},
	// update_total_amount: function(frm) {
	//     let total_cover = calculate_amount(frm, frm.doc.cover_money);
    //     frm.set_value('total_cover_money', total_cover);
    //     frm.set_value('amount_without_margin', total_cover);

    //     let total_com = calculate_amount(frm, frm.doc.commission);
    //     frm.set_value('total_commission', total_com);
    //     frm.set_value('margin_money', total_com);
        
    //     let total_amount = total_cover + total_com;
    //     if(total_amount > 0 ){
    //         frm.set_value('amount', total_amount);
        
    //         frm.set_value('total_amount', total_amount);
    //     }
	// }
	
});

frappe.ui.form.on('Cover Money', {
	cover_money_add: function(frm) {
       exchange_rate_from_CM = frm.selected_doc.exchange_rate;
	   frm.selected_doc.currency = frm.doc.currency;
	   frm.selected_doc.exchange_rate = 1;
	   refresh_field('cover_money');
	},
	currency: function(frm) {
        exchange_rate_from_CM = frm.selected_doc.exchange_rate;
	    frm.selected_doc.exchange_rate = get_exchange(frm.selected_doc.currency, frm.doc.bank_currency);
	    refresh_field('cover_money');
	    frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	    refresh_field("cover_money");
	},
	amount: function(frm) {
        exchange_rate_from_CM = frm.selected_doc.exchange_rate;
	    frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	    refresh_field("cover_money");
	},
});


frappe.ui.form.on('Commission', {
	commission_add: function(frm) {
	    frm.selected_doc.currency = frm.doc.currency;
	    frm.selected_doc.exchange_rate = 1;
	    refresh_field('commission');
	},
	currency: function(frm) {
	    frm.selected_doc.exchange_rate = get_exchange(frm.selected_doc.currency, frm.doc.bank_currency);
	    refresh_field('commission');
	    frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	    refresh_field("commission");
	},
	amount: function(frm) {
	    frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	    refresh_field("commission");
	}
});

frappe.ui.form.on('Document Payment', {
	payment_add: function(frm) {
	    if(!frm.doc.docstatus){
	        frm.doc.payment = [];
	        refresh_field('payment');
	        frappe.throw("Submit your Document first to make any payment");
	    } 
	    frm.selected_doc.currency = frm.doc.bank_currency;
	    frm.selected_doc.exchange_rate = 1;
	    refresh_field('payment');
	},
	currency: function(frm) {
	    frm.selected_doc.exchange_rate = get_exchange(frm.selected_doc.currency, frm.doc.bank_currency);
	    frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	    refresh_field("payment")
	},
	amount: function(frm) {
	  frm.selected_doc.exchanged_amount = frm.selected_doc.amount * frm.selected_doc.exchange_rate;
	  check_payment_limit(frm);
	  refresh_field("payment")  
	  frm.trigger("exchanged_amount")
	}
});

function check_payment_limit(frm) {
    let sum = 0;
    frm.doc.payment.forEach(pay => {
        sum += pay.amount * get_exchange(pay.currency, frm.doc.currency);
    });
    if(sum > frm.doc.amount) {
        frm.doc.payment.pop();
        refresh_field('payment');
        frappe.throw("you have exceeded the amount")
    }
}

function calculate_amount(frm, list) {
    let total_amount = 0;
    try {
        list.forEach(item => {
            if(item.exchange_rate != 0){
                total_amount += (item.amount * item.exchange_rate);
            }else{
                total_amount += item.amount;
            }
        });
    } catch(e) {}
    return total_amount;
}

function get_exchange(from, to) {
    if(from == to) return 1;
    let ex;
    frappe.call({
        async: false,
        method: 'frappe.client.get_value',
        args: {
            'doctype': 'Currency Exchange',
            'fieldname': ['exchange_rate'],
            'filters': {'from_currency':from , 'to_currency':to}
        },
        callback: function(r) {
            ex = r.message.exchange_rate
        }
    });
    return ex;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}




function delete_log(frm,name) {
    frappe.call({
        'async': false,
        'method': 'frappe.client.get_list',
        'args': {
            'doctype': 'Bank Account Log',
            'filters': {'bank_guarantee': name},
            'fields': ['name']
        },
        callback: function(r) {
            r.message.forEach(log => {
                frappe.db.delete_doc('Bank Account Log', log.name).then(() => frm.reload_doc());
            })
        }
    });
}
//bank_guarantee, bank_account, murabaha
function get_credit(params) {
    return frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    'doctype': 'Bank Account Log',
                    'fields': ['credit', 'debit', 'currency'],
                    'filters': { 
                        'bank_guarantee': params.bank_guarantee,
                        'bank_account': params.bank_account,
                        'murabaha': params.murabaha
                    }
                }
            });
    
}

function sum_credit(credit, currecy) {
    let exch = 1;
    let sum = 0;
    for(let c of credit) {
        exch = get_exchange(c.currency, currecy);
        sum += c.credit * exch - c.debit * exch;
    }
    return sum;
}


async function insert_log(frm, cat, type) {
    let nfrm = {...frm};
    let log = frappe.model.get_new_doc("Bank Account Log");
    log.bank_guarantee = frm.doc.name;
    log.bank_account = frm.doc.bank_account;
    log.currency = frm.doc.bank_currency;
    log.type = type;
    let exch = get_exchange(frm.doc.currency, frm.doc.bank_currency);
    console.log(exch +" The exchange rate comes from Currency Exchange from " + frm.doc.currency + " To "+ frm.doc.bank_currency)
    // console.log(frm.doc.amount)
    // console.log(frm.doc.amount * exch)
    // console.log(bank_guarantee);
    // console.log(frm.doc.bank_account);
    // console.log(frm.doc.bank_currency);
    log.debit = frm.doc.amount; 
    await frappe.db.insert(log)
}


function handle_refresh(frm) {
    frm.add_custom_button(__("Create Murabaha"), function() {
        let murabaha = frappe.model.get_new_doc("Murabaha");
        murabaha.bank_guarantee = frm.doc.name;
        frappe.set_route('Form', 'Murabaha', murabaha.name);
    });
    frm.doc.murabaha = [];
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            'doctype': 'Murabaha',
            'filters': {'bank_guarantee': frm.doc.name},
            'fields': ['name', 'buying_price','selling_price', 'currency'] 
        },
        callback: function(r) {
            if(r.messaage) {
                r.message.forEach(m => {
                    frm.add_child('murabaha', {
                        'murabaha_name': m.name,
                        'buying_price':  m.buying_price,
                        'selling_price': m.selling_price,
                        'currency': m.currency
                    });
                });
                refresh_field('murabaha');
            } else frm.set_df_property('murabaha', 'hidden', 1);
        }
    });
    frappe.call({
        method: 'frappe.client.get_list',
        args: {
            'doctype': 'Bank Account Log',
            'filters': {'bank_guarantee': frm.doc.name},
            'fields': ['credit', 'debit']
        },
        callback: function(r) {
            let remain = 0;
            r.message.forEach(log => {
                remain += (log.credit - log.debit)
                console.log(log.credit + " credit came from Bank Account Log");
            })
            remain *= -1;
            console.log(remain );
            remain = Math.max(0, remain) * get_exchange(frm.doc.bank_currency, frm.doc.currency)
            console.log(Math.max(0, remain));
            if(frm.doc.remaining !== remain)
                frm.set_value('remaining', remain)
            if(remain === 0) {
                if(frm.doc.payment_status !== "Paid") {
                    frm.set_value('payment_status', 'Paid');
                     frappe.db.set_value('Bank Guarantee', frm.doc.name, 'payment_status', 'Paid').then(() => frm.reload_doc());
                }
            }
            else if( remain > 0 && remain < frm.doc.amount) {
                if(frm.doc.payment_status !== "Partially Paid") {
                    frm.set_value('payment_status', 'Partially Paid');
                     frappe.db.set_value('Bank Guarantee', frm.doc.name, 'payment_status', 'Partially Paid').then(() => frm.reload_doc());
                }
            }
        }
    });
}


// function set_available(frm) {
//     return get_credit({'bank_account' : frm.doc.bank_account}).then(r => {
//         let balance = sum_credit(r.message, frm.doc.bank_currency);
//         return frappe.db.set_value('Bank Account', frm.doc.bank_account ,'available_credit', Math.min(frm.doc.bank_credit, frm.doc.bank_credit + balance));
//     });
// }
