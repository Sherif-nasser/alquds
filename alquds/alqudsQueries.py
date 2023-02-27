import json
import frappe

@frappe.whitelist()
def get_Item_inspection_Template(itemName):
    if itemName:
        lab_inspection_template= frappe.db.get_value("Item",
            filters={"name": itemName},
            fieldname=['quality_inspection_template_lab'])

        yard_inspection_template = frappe.db.get_value("Item",
            filters={"name": itemName},
            fieldname=['quality_inspection_template'])
    else:
        frappe.msgprint("Item Code is missing")

    
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

@frappe.whitelist()
def get_additional_salaries_punishment(EmployeeName,comp):
    additional_salaries = frappe.get_all("Additional Salary",
				fields=["creation","salary_component"],
				filters={"salary_component":["=",comp],
                        "employee":["=", EmployeeName]
        }
				)
    return additional_salaries


@frappe.whitelist()
def get_additional_salaries_history(EmployeeName,comp):
    additional_salarie = frappe.get_all("Additional Salary",
				fields=["creation","salary_component"],
				filters={"salary_component":["=",comp],
                        "employee":["=", EmployeeName]}
				)
    return additional_salarie

@frappe.whitelist()
def update_appraisal_factor(EmployeeName):
    componentName = ""
    appraisal = frappe.get_all("Appraisal",filters={"employee":["=", EmployeeName]})
    for obj in appraisal:
        doc = frappe.get_doc("Appraisal",obj.name).as_dict()
        for compo in doc.components:
            if compo.type == 'Late':
                value = compo.value
                componentName = compo.name
                frappe.db.set_value('Appraisal Components', compo.name, 'value', (value - 1))
              
    
    return f"{componentName}  Updated"

#{"name": "HR-APR-23-0200031", "owner": "ali@datasoft@eg.com", "creation": "2023-02-05 12:31:09.317994", "modified": "2023-02-05 12:31:13.923434", "modified_by": "ali@datasoft@eg.com", "docstatus": 1, "idx": 0, "naming_series": "HR-APR-.YY.-.MM.", "kra_template": "Title", "employee": "HR-EMP-00001", "employee_name": "Ahmed Mokbil", "salary_component": "Income Tax", "status": "Submitted", "start_date": "2023-02-01", "end_date": "2023-02-28", "department": null, "total_percentage": 0.0, "total_score": 2.0, "percentage": 44.0, "components_total_score": null, "overall_score": null, "remarks": null, "company": "DataSoft", "amended_from": null, "doctype": "Appraisal", "goals": [{"name": "62d66feb67", "owner": "ali@datasoft@eg.com", "creation": "2023-02-05 12:31:09.317994", "modified": "2023-02-05 12:31:13.923434", "modified_by": "ali@datasoft@eg.com", "docstatus": 1, "idx": 1, "kra": "first goal ", "per_weightage": 50.0, "score": 2.0, "score_earned": 1.0, "score_percentage": 40.0, "amount": 66.0, "parent": "HR-APR-23-0200031", "parentfield": "goals", "parenttype": "Appraisal", "doctype": "Appraisal Goal"}, {"name": "544d94a028", "owner": "ali@datasoft@eg.com", "creation": "2023-02-05 12:31:09.317994", "modified": "2023-02-05 12:31:13.923434", "modified_by": "ali@datasoft@eg.com", "docstatus": 1, "idx": 2, "kra": "second ", "per_weightage": 50.0, "score": 2.0, "score_earned": 1.0, "score_percentage": 40.0, "amount": 44.0, "parent": "HR-APR-23-0200031", "parentfield": "goals", "parenttype": "Appraisal", "doctype": "Appraisal Goal"}], "components": []}



@frappe.whitelist()
def update_item_quality_quds(name, status, qt_inspection,qt_Status_Lab,qt_Status_Yard,qt_lab = None,qt_yard=None):
    """
    update the status and quality inspection values of the Product Order Details

    name = Product Order Details name
    status = Product Order Details new status
    qt_inspection = Product Order Details new quality inspection value
    """
    doc = frappe.get_doc("Product Order Details", name)
    if qt_lab != None and qt_yard != None:
        
        doc.quality_status = status
        doc.item_status = "Inspected"
        doc.qt_inspection = qt_inspection
        doc.qt_inspection_lab = qt_lab
        doc.qt_inspection_yard = qt_yard
        doc.quality_status_lab = qt_Status_Lab
        doc.quality_status_yard = qt_Status_Yard
        doc.save()
        frappe.db.commit()
    else:
        doc.quality_status = status
        doc.item_status = "Inspected"
        doc.qt_inspection = qt_inspection
        doc.quality_status_lab = qt_Status_Lab
        doc.quality_status_yard = qt_Status_Yard
        doc.save()
        frappe.db.commit()
    return True



@frappe.whitelist()
def update_selected_row(doctype,docname,value):
    frappe.db.set_value(doctype, docname, 'selected_row', value, update_modified=False)
    doc = frappe.get_doc(doctype,docname).as_dict()
    return doc