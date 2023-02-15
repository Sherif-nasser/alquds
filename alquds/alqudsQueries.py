import json
import frappe

@frappe.whitelist()
def get_Item_inspection_Template(itemName):
    lab_inspection_template= frappe.db.get_value("Item",
        filters={"item_name": itemName},
        fieldname=['quality_inspection_template_lab'])

    yard_inspection_template = frappe.db.get_value("Item",
        filters={"item_name": itemName},
        fieldname=['quality_inspection_template'])

    
    return lab_inspection_template,yard_inspection_template

@frappe.whitelist()
def default_print_format():
    doc = frappe.get_doc("Product Order",'PO00004')
    print(doc.as_dict())
    return doc

@frappe.whitelist()
def quality_inspection_yard_list():
    qt_yard = frappe.get_list("Quality Inspection",
    filters={
        "item_code": "E.I.SH.R",
        "type": "صالة"
    },
    fields=["name"]
    )
    print(qt)
    return qt_yard

@frappe.whitelist()
def quality_inspection_lab_list():
    qt_lab = frappe.get_list("Quality Inspection",
    filters={
        "item_code": "E.I.SH.R",
        "type": "معملي"
    },
    fields=["name"]
    )
    return qt_lab
        



@frappe.whitelist()
def get_Sticker(rollWidth,filmWidth):
    # sticker = frappe.get_value("Image details",
    #     filters={"film_width": filmWidth,"roll_width":rollWidth},
    #     fieldname=['image'])
    sticker = frappe.get_list("Image details",
        filters={
            "film_width":filmWidth,
            "roll_width":rollWidth
        },
        fields=["image"]
        )
    
    return sticker


@frappe.whitelist()
def get_data_sheet(Thickness):
    sheetObj = ""
    ThicknessList = frappe.get_all("Roll Details",
				fields=["thickness"],
				filters={"thickness": Thickness}
				)
    
    if ThicknessList:
        print(f'ThicknessList  {ThicknessList}')
        S,CL,Fe,LifeTime = frappe.db.get_value("Roll Details",
            filters={"thickness": Thickness},
            fieldname=['s','cl','fe','life_time'])
        sheetObj = {
            "S" : S,
            "CL": CL,
            "Fe": Fe,
            "LifeTime":LifeTime
        }

    return sheetObj

@frappe.whitelist()
def get_item_printformat(item_serial):
    defaultPrintFormat = frappe.db.get_value("Item",
        filters={"item_name": item_serial},
        fieldname=['default_print_format','default_pallet_print_format'])
    return defaultPrintFormat

@frappe.whitelist()
def get_Item_name(item_code):
    itemName = frappe.db.get_value('Item',
        filters = {'item_code':item_code},
        fieldname= ['item_name'])
    return itemName
    
   