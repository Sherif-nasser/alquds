var totalGross = 0.0;
var totalNet = 0.0;
var remaining_reqd_weight =0.0; 
var all_rows = 0;
var remaining_items = 0;
var remaining_Entered_items = 0;

/// Product Order  /// 
frappe.ui.form.on("Product Order", {
  onload:function(frm){
    if(frm.doc.thickness){
      frappe.call({
        async: false,
        method: "alquds.alqudsQueries.get_data_sheet",
        args: {
          Thickness : frm.doc.thickness,
        },
        callback: function (r) {
          if(r.message){
            frm.selected_doc.s = r.message.S;
            frm.selected_doc.cl = r.message.CL
            frm.selected_doc.fe = r.message.Fe
            frm.selected_doc.life_time = r.message.LifeTime
            frm.set_df_property("s","hidden",0);
            frm.set_df_property("cl","hidden",0);
            frm.set_df_property("fe","hidden",0);
            frm.set_df_property("life_time","hidden",0);
        }else{
          console.log( "Thickness value doesn't exist in Roll Details Doctype");
          frm.set_df_property("s","hidden",1);
          frm.set_df_property("cl","hidden",1);
          frm.set_df_property("fe","hidden",1);
          frm.set_df_property("life_time","hidden",1);
        }
        },
      });
    }
    console.log(frm.doc.thickness);
  },
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
    remaining_item_serials:function(frm){
      frm.set_value("remaining_item_serials",remaining_items);
      frm.refresh_field("remaining_item_serials");
    },
    entered_item_serials:function(frm){
      frm.set_value("entered_item_serials",remaining_Entered_items);
      frm.refresh_field("entered_item_serials");
    },
    film_width:function(frm,cdt,cdn){
      var d = locals[cdt][cdn];
      if(d.sticker_roll_width){
        frappe.call({
          async: false,
          method: "alquds.alqudsQueries.get_Sticker",
          args: {
            rollWidth : d.sticker_roll_width,
            filmWidth : d.film_width
          },
          callback: function (r) {
            console.log(r.message);
            frm.selected_doc.sticker = r.message;
            frm.refresh_field("sticker");
            frm.refresh_field("image");
          },
        });
      }
    },
    sticker_roll_width:function(frm,cdt,cdn){
      var d = locals[cdt][cdn];
      if(d.film_width){
        frappe.call({
          async: false,
          method: "alquds.alqudsQueries.get_Sticker",
          args: {
            rollWidth : d.sticker_roll_width,
            filmWidth : d.film_width
          },
          callback: function (r) {
            console.log(r.message);
            frm.selected_doc.sticker = r.message;
            frm.refresh_field("sticker");
            frm.refresh_field("image");
          },
        });
      }
    },
    thickness:function(frm,cdt,cdn){
      var d = locals[cdt][cdn];
      frappe.call({
        async: false,
        method: "alquds.alqudsQueries.get_data_sheet",
        args: {
          Thickness : d.thickness,
        },
        callback: function (r) {
          if(r.message){
            console.log("sherif Nasser");
            frm.selected_doc.s = r.message.S;
            frm.selected_doc.cl = r.message.CL
            frm.selected_doc.fe = r.message.Fe
            frm.selected_doc.life_time = r.message.LifeTime
            frm.refresh_field("s");
            frm.refresh_field("cl");
            frm.refresh_field("fe");
            frm.refresh_field("life_time");
            frm.set_df_property("s","hidden",0);
            frm.set_df_property("cl","hidden",0);
            frm.set_df_property("fe","hidden",0);
            frm.set_df_property("life_time","hidden",0);
        }else{
          console.log( "Thickness value doesn't exist in Roll Details Doctype");
          frm.set_df_property("s","hidden",1);
          frm.set_df_property("cl","hidden",1);
          frm.set_df_property("fe","hidden",1);
          frm.set_df_property("life_time","hidden",1);
        }
        },
      });
    }

   
    
});

/// END Product Order  /// 



/// Product Order Details  /// 

frappe.ui.form.on("Product Order Details", {
    ref:function(frm,cdt,cdn){
      var d= locals[cdt][cdn]
      console.log(d.ref);

      // frappe.call({
      //   async: false,
      //   method: "alquds.alqudsQueries.get_item_printformat",
      //   args: {
      //     serial_number:
      //   },
      //   callback: function (r) {
        
      //   },
      // });

      $.each(frm.doc.product_details || [], function(i, row) {
          if(row.idx > (row.idx)-1){
            all_rows= row.idx;
          }
      });
      remaining_items = all_rows - d.idx;
      remaining_Entered_items = d.idx;
      frm.trigger("remaining_item_serials");
      frm.trigger("entered_item_serials");
    },
    gross_weight:function(frm){
        var totalQTY = frm.doc.quantity;
        console.log(totalQTY);
        console.log(frm.doc.weight_type);
        var totalGrossWeight = 0.0;
		$.each(frm.doc.product_details || [], function(i, row) {
			if (row.gross_weight) {
				totalGrossWeight += flt(row.gross_weight);
                totalGross = totalGrossWeight;
			}
		});
      
        if((totalQTY >= totalGross) && (frm.doc.weight_type == "وزن قائم")){
          console.log(frm.doc.weight_type);
            remaining_reqd_weight = totalQTY - totalGross
            frm.trigger("remaining_from_qt");
        }

        frm.trigger("gross_weight_sum");
        
    },
    net_weight:function(frm){
        var totalQTY = frm.doc.quantity;
        console.log(totalQTY);
        console.log(frm.doc.weight_type);
        var totalNetWeight = 0.0;
		$.each(frm.doc.product_details || [], function(i, row) {
			if (row.net_weight) {
				totalNetWeight += flt(row.net_weight);
                totalNet = totalNetWeight;
			}
		});

      if((totalQTY >= totalNet) && (frm.doc.weight_type == "وزن صافى"))
      {
        
        remaining_reqd_weight = totalQTY - totalNet
        frm.trigger("remaining_from_qt");
        console.log("inside net weight ");
      }
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

/// Product Order Details  /// 
