// Copyright (c) 2022, ahmed and contributors
// For license information, please see license.txt
frappe.require(["assets/sap/js/mqtt.min.js"]);
frappe.provide("frappe.meta");

var totalGross = 0.0;
var totalNet = 0.0;
var remaining_reqd_weight = 0.0;
var all_rows = 0;
var remaining_items = 0;
var remaining_Entered_items = 0;

var serials = [];

$.extend(frappe.meta, {
  get_print_formats: function (doctype) {
    var print_format_list = ["Standard"];
    var default_print_format = locals.DocType[doctype].default_print_format;
    let enable_raw_printing = frappe.model.get_doc(
      ":Print Settings",
      "Print Settings"
    ).enable_raw_printing;
    var print_formats = frappe
      .get_list("Print Format", { doc_type: doctype })
      .sort(function (a, b) {
        return a > b ? 1 : -1;
      });
    $.each(print_formats, function (i, d) {
      if (
        !in_list(print_format_list, d.name) &&
        d.print_format_type !== "JS" &&
        (cint(enable_raw_printing) || !d.raw_printing)
      ) {
        print_format_list.push(d.name);
      }
    });

    const cur_print_format =
      locals["Product Order"][Object.keys(locals["Product Order"]).pop()]
        .print_format;
    if (cur_print_format) {
      return [cur_print_format];
      // default_print_format = cur_print_format;
      // console.log(default_print_format)
      // var index = print_format_list.indexOf(default_print_format);
      // print_format_list.splice(index, 1).sort();
      // print_format_list.unshift(default_print_format);
      // console.log(print_format_list)
      // return print_format_list;
    }
    return print_format_list;
  },
});

frappe.ui.form.on("Product Order", {
  setup: function (frm) {
    var print_format_list = [];
    let enable_raw_printing = frappe.model.get_doc(
      ":Print Settings",
      "Print Settings"
    ).enable_raw_printing;
    var print_formats = frappe
      .get_list("Print Format", { doc_type: frm.doc.doctype })
      .sort(function (a, b) {
        return a > b ? 1 : -1;
      });
    $.each(print_formats, function (i, d) {
      if (
        !in_list(print_format_list, d.name) &&
        d.print_format_type !== "JS" &&
        (cint(enable_raw_printing) || !d.raw_printing)
      ) {
        print_format_list.push(d.name);
      }
    });
    frm.set_df_property("print_format", "options", print_format_list);
  },
  onload: function (frm) {
    // set items to read only if sent to sap
    frm.page.sidebar.toggle(false);
    if (!cur_frm.doc.docstatus)
      frm.set_value("shift_employee", frappe.user.name);
    frm.doc.product_details.forEach((product) => {
       if (product.item_status == "Sent to SAP") product.docstatus = 1;
    });
    refresh_field("product_details");
  },
  close_po: function(frm) {
    frm.set_value("order_status", "Finished");
    refresh_field("order_status");
    console.log(frm.selected_doc.order_status);
},
gross_weight_sum: function(frm, cdt, cdn) {
    frm.set_value("gross_weight_sum", totalGross);
    frm.refresh_field("gross_weight_sum");
},
net_weight_sum: function(frm) {
    frm.set_value("net_weight_sum", totalNet);
    frm.refresh_field("net_weight_sum");
},
remaining_from_qt: function(frm) {
    frm.set_value("remaining_from_qt", remaining_reqd_weight.toFixed(3));
    frm.refresh_field("remaining_from_qt");
},
remaining_item_serials: function(frm) {
    frm.set_value("remaining_item_serials", remaining_items);
    frm.refresh_field("remaining_item_serials");
},
entered_item_serials: function(frm) {
    frm.set_value("entered_item_serials", remaining_Entered_items);
    frm.refresh_field("entered_item_serials");
},
film_width: function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d.sticker_roll_width) {
        frappe.call({
            async: false,
            method: "alquds.alqudsQueries.get_Sticker",
            args: {
                rollWidth: d.sticker_roll_width,
                filmWidth: d.film_width
            },
            callback: function(r) {
                var images = []
                var stickers = r.message;
                stickers.forEach((obj)=>{
                    images.push(obj.image);
                })
                set_field_options("stickers", images)
                // frm.selected_doc.sticker = r.message;
                
            },
        });
    }
    frm.refresh_field("image");
},
stickers:function(frm,cdt,cdn){
    var d =locals[cdt][cdn]
    d.sticker = d.stickers;
    frm.refresh_field("sticker");
    frm.refresh_field("image");
},
sticker_roll_width: function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
    if (d.film_width) {
        frappe.call({
            async: false,
            method: "alquds.alqudsQueries.get_Sticker",
            args: {
                rollWidth: d.sticker_roll_width,
                filmWidth: d.film_width
            },
            callback: function(r) {
                var images = []
                var stickers = r.message;
                stickers.forEach((obj)=>{
                    images.push(obj.image);
                })
                set_field_options("stickers", images)
                // frm.selected_doc.sticker = r.message;
                
            },
        });
    }
    frm.refresh_field("image");
},
  generate: function (frm) {
    let items = parseInt(frm.doc.rolls_no);
    let index;
    // var ref = "";
    if (frm.doc.product_details) index = frm.doc.product_details.length;
    else index = 0;

    for (let i = index; i < items + index; i++) {
      frm.add_child("product_details", {
        // row_no: `${frm.doc.document_no}-${i+1}`,
        ref: `${frm.doc.item_serial}-${frm.doc.length}-${frm.doc.width}`,
        length:`${frm.doc.length}`,
      });
    }
    frm.set_value("order_status", "In Progress");
    refresh_field("product_details");
    console.log(frm.doc.item_serial);
        // var item_serial = "";
    
        // $.each(frm.doc.product_details || [], function(i, row) {
        //     ref = frm.doc.product_details[0].ref
 
        // });

        // if (ref != "") {
        //     item_serial = ref.split('-')[0];
        // }
       
        
        frappe.call({
            method: "alquds.alqudsQueries.get_item_printformat",
            args: {
                item_serial: frm.doc.item_serial
            },
            callback: function(r) {
                // console.log(r.message);
                frm.doc.print_format = r.message[1]; // default_pallet_print_format
                frm.doc.pallet_print_format = r.message[0]; // default_print_format
                frm.refresh_field("print_format");
                frm.refresh_field("pallet_print_format");
            }
        });
  },
  update_item_waiting_quality: function (frm) {
    let items = frm.get_selected().product_details;

    if (!items) frappe.throw("Select items to be sent");

    items.forEach((item) => {

      if (locals["Product Order Details"][item].item_status == "Waiting Quality")
        frappe.throw("Some items already is Waiting Quality");
      else {
        frappe.call({
          method: "sap.api.update_item_waiting_quality",
          args: {
            name: locals["Product Order Details"][item].name,

          },
          callback:function(r){
            frappe.msgprint("Succesfuly Qc")
            frm.reload_doc();

          }
        });
      }
   
      frm.save().then(() => frm.trigger("reload"));

      //refresh_field("product_details");

    });

  },
  send_to_sap: function (frm) {
    is_doc_instantiated(frm);

    frappe.show_progress("Sending items to Sap..", 20, 100, "Please wait");

    let items = frm.get_selected().product_details;

    if (!items) frappe.throw("Select items to be sent");

    items.forEach((item) => {
      if (locals["Product Order Details"][item].item_status == "Sent to SAP")
        frappe.throw("Some items already sent to SAP");
    });
    frappe.call({
      async: false,
      method: "sap.api.send_product_to_sap",
      args: {
        product_name: frm.doc.name,
        items: JSON.stringify(items),
      },
      callback: function (r) {
        frappe.show_progress("Sending items to Sap..", 100, 100, "Please wait");
        frappe.hide_progress();
        if (!r.message.success) {
          frappe.throw(r.message.message);
        } else {
          for (let item of items) {
            frappe.model.set_value(
              "Product Order Details",
              item,
              "item_status",
              "Sent to SAP"
            );
          }
        }
      },
    });
    frm.save().then(() => frm.trigger("onload"));
  },
  print_selected_pallet: function (frm) {
    // stop here
    // if(frm.doc.pallet_print_format){
    //     frappe.get_meta("Product Order").default_print_format = frm.doc.pallet_print_format;
    // }
    // console.log(frappe.get_meta("Product Order"));
    // console.log(frappe.get_meta("Product Order").default_print_format);

    is_doc_instantiated(frm);
    console.log(frm.doc.docstatus);
    if (!frm.doc.docstatus)
      frm.doc.product_details.forEach((product) => {
        frappe.model.set_value(
          "Product Order Details",
          product.name,
          "item_status",
          "Waiting Quality"
        );
      });

    let d = new frappe.ui.Dialog({
      title: "Enter Pallet Number",
      fields: [
        { label: "Pallet No", fieldname: "pallet_no", fieldtype: "Data" },
      ],
      primary_action_label: "Print",
      primary_action(values) {
        var pallets = "";
        if(values.pallet_no.includes(',')){
             pallets = values.pallet_no.split(',');
             pallets.forEach((palletNo) =>{
                print_selected_doc(frm,palletNo);
            })
        
        }else{
            pallets = values.pallet_no;
            print_selected_doc(frm,pallets);
        
        }
        
        // frm.doc.selected_pallet_no = values.sap_pallet_no;
        
        d.hide();
        frm.print_doc();
        
    },
});

    d.show();
    function print_selected_doc(frm,palletref) {
           
           
        frm.doc.selected_product = [];
        let i = 1;
        frm.doc.product_details.forEach((product) => {
            if (product.pallet_no == palletref) {
                frm.doc.selected_product.push({
                    ...product,
                    idx: i
                });
                i += 1;
            }
        });
        frm.refresh_field("selected_product");
        // frm.print_doc();
    }
  },
});

frappe.ui.form.on("Product Order Details", {
    gross_weight: function(frm,cdt,cdn) {
        var d = locals[cdt][cdn]
        var totalQTY = frm.doc.quantity;
        var totalGrossWeight = 0.0;

        $.each(frm.doc.product_details || [], function(i, row) {
            if (row.gross_weight) {
                totalGrossWeight += flt(row.gross_weight);
                totalGross = totalGrossWeight;
            }
            if (row.idx > (row.idx) - 1) {
                all_rows = row.idx;
            }
        });
        remaining_items = all_rows - d.idx;
        remaining_Entered_items = d.idx;

        if ((totalQTY >= totalGross) && (frm.doc.weight_type == "ÙˆØ²Ù† Ù‚Ø§Ø¦Ù…")) {
            console.log(frm.doc.weight_type);
            remaining_reqd_weight = totalQTY - totalGross
            frm.trigger("remaining_from_qt");
        }

        frm.trigger("gross_weight_sum");
        frm.trigger("remaining_item_serials");
        frm.trigger("entered_item_serials");

    },
    net_weight: function(frm) {
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

        if ((totalQTY >= totalNet) && (frm.doc.weight_type == "ÙˆØ²Ù† ØµØ§ÙÙ‰")) {

            remaining_reqd_weight = totalQTY - totalNet
            frm.trigger("remaining_from_qt");
            console.log("inside net weight ");
        }
        frm.trigger("net_weight_sum");

    },
  measure: function (frm) {
    const options = {
      clean: true, // retain session
      connectTimeout: 3000, // Timeout period increased to 30 seconds
      // Authentication information
      // clientId: 'foobar_test_random' + Math.floor(Math.random() * 10000),
    };
    const connectUrl = "wss://test.mosquitto.org:8081";
    const client = mqtt.connect(connectUrl, options);

    //actually subscribe to something on a sucessfull connection
    client.on("connect", (connack) => {
      if (frm.selected_doc.scaler) client.subscribe(frm.selected_doc.scaler);
    });

    client.on("reconnect", (error) => {
      console.log("reconnecting:", error);
    });

    client.on("error", (error) => {
      console.log("Connection failed:", error);
    });

    client.on("message", (topic, message) => {
      frm.selected_doc.net_weight = message.toString();
      refresh_field("product_details");
      client.unsubscribe(frm.selected_doc.scaler);
    });
  },
  print_qr: function (frm) {
    frm.reload_doc();
    is_doc_instantiated(frm);
    let row = frm.selected_doc.idx;
 
    update_selected_row(frm,row);
    
    refresh_field("selected_row");

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
        "selected_qr",
        frm.doc.product_details[row - 1].qr_code
      );
      
    frm.save();
    printQr(frm);
    }  
},

  qt_inspection: function (frm) {
    frappe.call({
      method: "frappe.client.get",
      args: {
        doctype: "Quality Inspection",
        name: frm.selected_doc.qt_inspection,
      },
      callback: function (r) {
        // frm.selected_doc.quality_status = r.message.status;
        frappe.model.set_value(
          "Product Order Details",
          frm.selected_doc.name,
          "quality_status",
          r.message.status
        );
        refresh_field("product_details");
      },
    });
  },
  get_indicator: function (frm) {
    return [
      __(frm.doc.product_details.quality_status),
      {
        Rejected: "red",
        Accepted: "green",
      }[frm.doc.product_details.quality_status],
      "quality_status,=," + frm.doc.product_details.quality_status,
    ];
  },
});

function is_doc_instantiated(frm) {
  // let name = frm.doc.name.split("-");
  if (frm.doc.__unsaved) frappe.throw("Save the Doc to generate qr code");
}

function printQr(frm){

    frappe.utils.print(
        frm.doctype,
        frm.docname,
        frm.doc.pallet_print_format,
        frm.doc.letter_head,
        frm.doc.language || frappe.boot.lang
    );
}

function update_selected_row(frm,row){
    frappe.call({
        method: "alquds.alqudsQueries.update_selected_row",
        args: {
          doctype: "Product Order",
          docname: frm.docname,
          value: row - 1
        },
        callback: function (r) {
        // console.log(r.message.selected_row);
        // console.log(r.message);
        },
      });
}