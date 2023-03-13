frappe.ui.form.on('Murabaha', {
    buying_price: function(frm) {
      if(!frm.doc.selling_price || frm.doc.selling_price === 0)
        frm.set_value("selling_price", frm.doc.buying_price);
      else frm.trigger("selling_price");
    },
    after_save: function(frm) {
        frappe.call({
            async: false,
            method: 'frappe.client.get_list',
            args: {
                'doctype': 'Bank Account Log',
                'filters': {'murabaha': frm.doc.name}
            },
            callback: function(r) {
                async function logging(r) {
                    for(let log of r.message) {
                        await frappe.db.delete_doc("Bank Account Log", log.name)
                    }
                    frm.reload_doc();
                }
                logging(r)
            }
        });
        
        async function handle_save() {
            let log = frappe.model.get_new_doc("Bank Account Log");
            log.bank_guarantee = frm.doc.bank_guarantee;
            log.bank_account = frm.doc.bank_account;
            log.currency = frm.doc.bank_currency;
            log.murabaha = frm.doc.name;
            log.type = 'murabaha';
            let exch = get_exchange(frm.doc.currency, frm.doc.bank_currency);
            log.credit = frm.doc.buying_price * exch;
            await frappe.db.insert(log);
            
            log = frappe.model.get_new_doc("Bank Account Log");
            log.currency = frm.doc.currency;
            log.murabaha = frm.doc.name;
            log.debit = frm.doc.buying_price;
            await frappe.db.insert(log);
            
            for(let payment of frm.doc.payment) {
                log = frappe.model.get_new_doc("Bank Account Log");
                log.murabaha = frm.doc.name;
                log.currency = frm.doc.currency;
                log.credit = payment.payment_after_exch;
                await frappe.db.insert(log);
            }
            frm.reload_doc();
        }
        handle_save();
        
    },
    selling_price: function(frm) {
        frm.set_value('benefits_value', frm.doc.selling_price - frm.doc.buying_price);
        frm.set_value('benefits_ratio', (frm.doc.benefits_value/frm.doc.buying_price)*100);
    },
    before_save: function(frm) {
        let total = 0;
        if(frm.doc.payment && frm.doc.payment.length > 0) {
            frm.doc.payment.forEach(p => {
                total += p.payment_after_exch;
            });
            if(total > frm.doc.selling_price) frappe.throw("exceeded selling price");
            frm.set_value("total_payment", total);
            frm.set_value("remaining", frm.doc.selling_price - total);
        } else {
            frm.set_value("total_payment", 0);
            frm.set_value("remaining", frm.doc.selling_price);
            frm.set_value("status", "Issued");
        }

    },
    get_bank_balance: function(frm) {
        let transactions = get_account_credit(frm.doc.bank_account);
        let log_credit = 0;
	    for(let i of transactions) {
	        log_credit += i['credit'] - i['debit'];
	    }
        let credit_av = Math.min(parseFloat(frm.doc.bank_limit) + log_credit, parseFloat(frm.doc.bank_limit));
        frm.set_value("balance", credit_av);
        frm.trigger('onload');
    },
    onload_post_render: function(frm) {
        if(frm.doc.name.includes('new-murabaha')) {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    'doctype': 'Bank Account Log',
                    'filters': {'bank_guarantee': frm.doc.bank_guarantee},
                    'fields': ['credit', 'debit', 'currency']
                },
                callback: function(r) {
                    let remain = 0;
                    r.message.forEach(log => {
                        if(log.currency == frm.doc.currency)
                            remain += (log.credit - log.debit);
                        else remain += (log.credit - log.debit) * get_exchange(log.currency, frm.doc.currency);
                    });
                    remain *= -1;
                    remain = Math.max(0, remain);
                    frm.set_value('buying_price', remain);
                }
            });
        }
        else {
            frappe.call({
                method: 'frappe.client.get_list',
                args: {
                    'doctype': 'Bank Account Log',
                    'filters': {'murabaha': frm.doc.name, 'bank_guarantee': ['!=', frm.doc.bank_guarantee]},
                    'fields': ['credit', 'debit', 'currency']
                },
                callback: function(r) {
                    // let remain = 0;
                    // r.message.forEach(log => {
                    //     if(log.currency == frm.doc.currency)
                    //         remain += (log.credit - log.debit)
                    //     else remain += (log.credit - log.debit) * get_exchange(log.currency, frm.doc.currency);
                    // });
                    // remain *= -1;
                    if(frm.doc.remaining === 0) {
                        if(frm.doc.status !== "Paid") {
                            frm.set_value('status', 'Paid');
                            frappe.db.set_value('Murabaha', frm.doc.name, 'status', 'Paid').then(() => frm.reload_doc());
                        }
                    }
                    else if(frm.doc.remaining > 0 && frm.doc.remaining < frm.doc.selling_price){//remain > 0 && remain < frm.doc.selling_price) {
                        
                        if(frm.doc.status !== "Partially Paid") {
                            frm.set_value('status', 'Partially Paid');
                            frappe.db.set_value('Murabaha', frm.doc.name, 'status', 'Partially Paid').then(() => frm.reload_doc());
                        }
                    }
                }
            });
        }
        
    }
    
});

frappe.ui.form.on('Murabaha Payment', {
    payment_add: function(frm) {
        frm.selected_doc.payment_currency = frm.doc.currency;
	    frm.selected_doc.payment_exchange_rate = 1;
	    refresh_field('payment');
    },
    payment_currency: function(frm) {
        // console.log( get_exchange(frm.selected_doc.payment_currency, frm.doc.currency))
        frm.selected_doc.payment_exchange_rate = get_exchange(frm.selected_doc.payment_currency, frm.doc.bank_currency);
	    refresh_field('payment');
    },
    payment_amount: function(frm) {
        frm.selected_doc.payment_after_exch = frm.selected_doc.payment_exchange_rate * frm.selected_doc.payment_amount;
        refresh_field('payment');
    }
});


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
            ex = r.message.exchange_rate;
        }
    });
    return ex;
}

function calculate_amount(frm, list) {
    let total_payment_amount = 0;
    list.forEach(item => {
        total_payment_amount += item.payment_after_exch;
    });
    return total_payment_amount;
}

function get_bank_balance(bank) {
    let credit;
    frappe.call({
        async: false,
        method: 'frappe.client.get_value',
        args: {
            'doctype': 'Bank Account',
            'name': bank,
            'fieldname': ['credit'],
        },
        callback: function(r) {
            credit = r.message.credit;
        }
    });
    return credit;
        
}



function get_account_credit(account) {
    
    let transactions;
    frappe.call({
        async: false,
        method: 'frappe.client.get_list',
        args: {
            'doctype': 'Bank Account Log',
            'filters': {'bank_account': account},
            'fields': ['credit', 'debit'] 
        },
        callback: function(r) {
            transactions = r.message;
        }
    });
    return transactions
}

