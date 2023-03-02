import datetime
import requests
import frappe
import json
import time
from sap.qr_generator import get_qr



@frappe.whitelist()
def send_single_item_to_sap(product_name, itemName=None):
    log = frappe.new_doc("Sap Integration Log")
    item = frappe.db.get("Product Order Details", itemName)

    post_product_setting = frappe.get_doc("Post Product Setting").as_dict()

    login_url = post_product_setting["login_url"]
    password = post_product_setting["password"]
    username = post_product_setting["user_name"]
    company_db = post_product_setting["company_db"]
    url = post_product_setting["product_url"]


    session_id = session_login(login_url, company_db, username, password)
    
    ignored = {"name", "owner", "creation", "modified", "modified_by", "parent", "parentfield", "parenttype", "idx",
               "docstatus", "company_db", "user_name", "password", "default_scaler", "doctype", "login_url", "product_url"}
   
   
    product = frappe.db.get('Product Order', product_name)
    log.product = product.name
    log.product_no = product.document_no
    log.items = ""
    data = {
        "DocType": "dDocument_Items",
        "DocDate": str(product.creation.date()),
        "DocumentLines": [
            {
                "BaseType": 202,
                "BaseEntry": product.document_no
            }
        ]
    }

    batch_number = []
    total_quantity = 0
    batch = {}
    batch["BatchNumber"] = str(product.item_no) + "/" + str(product.code)+"/" + str(item.idx)
    batch["AddmisionDate"] = str(item.get("creation").date())

    if product.get("weight_type_sap") == "Net Weight":
        try:
            batch["Quantity"] = item.get("remaining_n_weight")
            total_quantity += float(item["new_total_net"])
        except:
            return {"success": False,
                    "message": "make sure you set all items Net Weight"}

    else:
        try:
            batch["Quantity"] = item.get("remaining_g_weight")
            total_quantity += float(item["new_total_gross"])
        except:
            return {"success": False,
                    "message": "make sure you set all items Net Weight"}

    batch["InternalSerialNumber"] = product.get("sorder")
    batch["U_B1Customer"] = product.customer_name
    batch["Location"] = str(product.item_no) + \
            '/' + str(item.get("pallet_no", ''))
    
    for value in post_product_setting:
            if value not in ignored:
                batch[post_product_setting[value]
                      ] = product.get(value, '')

    batch[post_product_setting["net_weight"]
              ] = item.get("net_weight", '')
    batch[post_product_setting["gross_weight"]
            ] = item.get("gross_weight", '')
    batch[post_product_setting["jambo_roll_no"]
            ] = item.get("jambo_roll_no", '')
    batch[post_product_setting["roll_status"]
            ] = item.get("quality_status", '')
    batch_number.append(batch)


    data["DocumentLines"][0]["BatchNumbers"] = batch_number
    data["DocumentLines"][0]["Quantity"] = total_quantity

    headers = {
        'Cookie': f'B1SESSION={session_id}'
    }
    payload = json.dumps(data)
    #frappe.throw(payload)
    response = requests.request("POST", url, headers=headers, data=payload)
    resp = json.loads(response.text)
    if response.status_code == 201:
        log.status = "Success"
        log.insert()
        frappe.db.commit()
        return {"success": True}
    else:
        log.status = "Failed"
        log.message = f"SAP: {resp['error']['message']['value']}"
        log.insert()
        frappe.db.commit()
        return {"success": False, "message": f"SAP: {resp['error']['message']['value']}"}