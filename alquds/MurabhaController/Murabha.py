import frappe 


@frappe.whitelist()
def update_bank_account(bank_account,total_amount):
    AccountDoc = frappe.get_all("Bank Account",filters = {"name":bank_account})
    for account in AccountDoc:
        Account = frappe.get_doc("Bank Account",account.name)
        updated_credit = Account.credit - total_amount
        if updated_credit > 0:
            frappe.db.set_value("Bank Account", account.name, 'available_credit', updated_credit, update_modified=False)
        else:
            frappe.msgprint('Bank Credit is not enough')
    else:
        print("No bank account found")






    