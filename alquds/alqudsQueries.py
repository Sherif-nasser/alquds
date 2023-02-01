import json
import frappe

@frappe.whitelist()
def get_Item_inspection_Template(itemName):
    lab_inspection_template,yard_inspection_template = frappe.db.get_value("Item",
        filters={"item_name": itemName},
        fieldname=['quality_inspection_template_lab','quality_inspection_template'])
    return lab_inspection_template,yard_inspection_template



@frappe.whitelist()
def get_Sticker(rollWidth,filmWidth):
    sticker = frappe.db.get_value("Image details",
        filters={"film_width": filmWidth,"roll_width":rollWidth},
        fieldname=['image'])
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
   