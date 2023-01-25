import frappe
from frappe.model.document import Document
from hrms.hr.doctype.attendance.attendance import Attendance

class modefiedClass(Document):
    def validate_duplicate_record(self):
	    print("\n\n\n\n\n Enta prenss yad \n\n\n\n\n\n")