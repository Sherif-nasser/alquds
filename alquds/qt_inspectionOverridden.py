import frappe
from frappe.model.document import Document
from erpnext.stock.doctype.quality_inspection.quality_inspection import QualityInspection
from erpnext.stock.doctype.quality_inspection_template.quality_inspection_template import (
	get_template_details,
)

class submitMethodClass(Document):
    
        @frappe.whitelist()
        def get_item_specification_details(self):
            if not self.quality_inspection_template:
                self.quality_inspection_template = frappe.db.get_value(
                    "Item", self.item_code, "quality_inspection_template"
                )

            if not self.quality_inspection_template:
                return

            self.set("readings", [])
            parameters = get_template_details(self.quality_inspection_template)
            for d in parameters:
                child = self.append("readings", {})
                child.update(d)
                child.status = "Accepted"

        @frappe.whitelist()
        def get_quality_inspection_template(self):
            template = ""
            if self.bom_no:
                template = frappe.db.get_value(
                    "BOM", self.bom_no, "quality_inspection_template"
                )

            if not template:
                template = frappe.db.get_value(
                    "BOM", self.item_code, "quality_inspection_template"
                )

            self.quality_inspection_template = template
            self.get_item_specification_details()

        def on_submit(self):
            print("none")

