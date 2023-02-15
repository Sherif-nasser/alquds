import frappe
from frappe.model.document import Document
from erpnext.stock.doctype.quality_inspection.quality_inspection import QualityInspection

class submitMethodClass(Document):
    @frappe.whitelist()
    def get_item_specification_details(self):
        if not self.quality_inspection_template:
            self.quality_inspection_template = frappe.db.get_value(
                "Item", self.item_code, "quality_inspection_template"
            )

        if not self.quality_inspection_template:
            return

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

