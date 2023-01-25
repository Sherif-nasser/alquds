var totalGross = 0.0;
var totalNet = 0.0;
var remaining_reqd_weight =0.0; 


frappe.ui.form.on("Product Order", {
    close_po:function(frm){
        frm.set_value("order_status","Finished");
        refresh_field("order_status");
        console.log(frm.selected_doc.order_status);
    },
    gross_weight_sum:function(frm,cdt,cdn){
        frm.set_value("gross_weight_sum",totalGross);
        frm.refresh_field("gross_weight_sum");
    },
    net_weight_sum:function(frm){
        frm.set_value("net_weight_sum",totalNet);
        frm.refresh_field("net_weight_sum");
    },
    remaining_from_qt:function(frm){
        frm.set_value("remaining_from_qt",remaining_reqd_weight.toFixed(3));
        frm.refresh_field("remaining_from_qt");
    },
   
    
});

frappe.ui.form.on("Product Order Details", {
    gross_weight:function(frm){
        var totalQTY = frm.doc.quantity;
        var totalGrossWeight = 0.0;
		$.each(frm.doc.product_details || [], function(i, row) {
			if (row.gross_weight) {
				totalGrossWeight += flt(row.gross_weight);
                totalGross = totalGrossWeight;
			}
		});
        if(totalQTY > totalGross ){
            remaining_reqd_weight = totalQTY - totalGross
        }else{
            msgprint("Total quantity fulfiled");
        }
        frm.trigger("gross_weight_sum");
        frm.trigger("remaining_from_qt");
    },
    net_weight:function(frm){
        var totalNetWeight = 0.0;
		$.each(frm.doc.product_details || [], function(i, row) {
			if (row.net_weight) {
				totalNetWeight += flt(row.net_weight);
                totalNet = totalNetWeight;
			}
		});
        frm.trigger("net_weight_sum");
    },
    print_qr: function (frm) {
        // is_doc_instantiated(frm);
        let row = frm.selected_doc.idx;
        frappe.call({
          async: false,
          method: "sap.api.generate_qr",
          args: {
            data: {
              customer_no: frm.doc.customer_no,
              customer_name: frm.doc.customer_name,
              item_no: frm.doc.item_serial,
              product_no: frm.doc.item_no,
              net_weight: frm.selected_doc.net_weight,
              gross_weight: frm.selected_doc.gross_weight,
            },
          },
          callback: function (r) {
            frm.selected_doc.qr_code = r.message;
            refresh_field("product_details");
            if (
              frm.selected_doc.item_status !== "Inspected" &&
              !frm.selected_doc.docstatus
            ) {
              frappe.model
                .set_value(
                  "Product Order Details",
                  frm.selected_doc.name,
                  "item_status",
                  "Waiting Quality"
                )
                .then(() => {
                  if (frm.doc.__unsaved == 1) {
                    frm.save().then(() => {
                      print_product_details(frm, row);
                    });
                  } else {
                    print_product_details(frm, row);
                  }
                });
            } else {
              print_product_details(frm, row);
            }
          },
        });
    
    
        function print_product_details(frm, row) {
          // frm.doc.selected_qr = frm.doc.product_details[row - 1].qr_code;
          // frm.doc.selected_row = row - 1;
          frappe.model.set_value(
            "Product Order",
            frm.doc.name,
            "selected_row",
            row - 1
          );
          frappe.model.set_value(
            "Product Order",
            frm.doc.name,
            "selected_qr",
            frm.doc.product_details[row - 1].qr_code
          );
          // refresh_field("selected_qr");
          // refresh_field("selected_row");
          frm.save();
          // frm.doc.product_details[row-1].item_status = "Waiting Quality"
          frm.print_doc();
    
          //This part is retaled to AlQouds application
          setTimeout(function() {
            try{
            frappe.call({
              method: "alquds.alquds.Qouds.get_html_and_style",
              args:{
                doc : frm.doc.doctype,
                name: frm.doc.name,
              },
              callback: function (r) {
                // console.log(r.message);
                var style = r.message.style;
                var html = r.message.html;
                var newWindow = window.open();
                newWindow.document.write(
                  `
                  <!DOCTYPE html>
    <html lang="en" dir="ltr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print it</title>
        <meta name="generator" content="frappe">
        
      <link rel="stylesheet" href="public/dist/print.bundle.CBC37ASE.css">
        
            <style>\
        `
        +
            style
        +
        `
            </style>
        
    </head>
    <body>
        <div class="action-banner print-hide">
            <a class="p-2" onclick="window.print();">
                Print
            </a>
            <a class="p-2"
                href="/api/method/frappe.utils.print_format.download_pdf?doctype={{doctype}}&name={{name}}&key={{key}}">
                Get PDF
            </a>
        </div>
        <div class="print-format-gutter">
            <div class="print-format">
        `
                +
          html
          +
        `
            </div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const page_div = document.querySelector('.page-break');
    
                page_div.style.display = 'flex';
                page_div.style.flexDirection = 'column';
    
                const footer_html = document.getElementById('footer-html');
                footer_html.classList.add('hidden-pdf');
                footer_html.classList.remove('visible-pdf');
                footer_html.style.order = 1;
                footer_html.style.marginTop = '20px';
            });
        </script>
    </body>
    </html>
    
                    `
                    
                  );
                // newWindow.document.write(r.message.html);
                newWindow.print();
              },
            });
          }catch(e){
            msgprint(e.message)
          }
             },900 );
            
          //app/print/Product Order/PO01066
          //printview?doctype=Product%20Order&name=PO01066&trigger_print=1&format=Standard&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en
        } },
});

