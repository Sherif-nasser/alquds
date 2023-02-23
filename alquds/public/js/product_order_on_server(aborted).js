// var totalGross = 0.0;
// var totalNet = 0.0;
// var remaining_reqd_weight = 0.0;
// var all_rows = 0;
// var remaining_items = 0;
// var remaining_Entered_items = 0;

// var serials = [];
// // /// Product Order  /// 
// frappe.ui.form.on("Product Order", {
// //     onload: function(frm) {
        
        
// //         // frappe.call({
// //         //     method: "alquds.alqudsQueries.default_print_format",
// //         //     callback:function(r){
// //         //         console.log(r.message);
// //         //     }
// //         // })
// //         // if (frm.doc.thickness) {
// //         //     frappe.call({
// //         //         async: false,
// //         //         method: "alquds.alqudsQueries.get_data_sheet",
// //         //         args: {
// //         //             Thickness: frm.doc.thickness,
// //         //         },
// //         //         callback: function(r) {
// //         //             if (r.message) {
// //         //                 frm.selected_doc.s = r.message.S;
// //         //                 frm.selected_doc.cl = r.message.CL
// //         //                 frm.selected_doc.fe = r.message.Fe
// //         //                 frm.selected_doc.life_time = r.message.LifeTime
// //         //                 frm.set_df_property("s", "hidden", 0);
// //         //                 frm.set_df_property("cl", "hidden", 0);
// //         //                 frm.set_df_property("fe", "hidden", 0);
// //         //                 frm.set_df_property("life_time", "hidden", 0);
// //         //             } else {
// //         //                 console.log("Thickness value doesn't exist in Roll Details Doctype");
// //         //                 frm.set_df_property("s", "hidden", 1);
// //         //                 frm.set_df_property("cl", "hidden", 1);
// //         //                 frm.set_df_property("fe", "hidden", 1);
// //         //                 frm.set_df_property("life_time", "hidden", 1);
// //         //             }
// //         //         },
// //         //     });
// //         // }
// //         // console.log(frm.doc.thickness);
// //     },
//     close_po: function(frm) {
//         frm.set_value("order_status", "Finished");
//         refresh_field("order_status");
//         console.log(frm.selected_doc.order_status);
//     },
//     gross_weight_sum: function(frm, cdt, cdn) {
//         frm.set_value("gross_weight_sum", totalGross);
//         frm.refresh_field("gross_weight_sum");
//     },
//     net_weight_sum: function(frm) {
//         frm.set_value("net_weight_sum", totalNet);
//         frm.refresh_field("net_weight_sum");
//     },
//     remaining_from_qt: function(frm) {
//         frm.set_value("remaining_from_qt", remaining_reqd_weight.toFixed(3));
//         frm.refresh_field("remaining_from_qt");
//     },
//     remaining_item_serials: function(frm) {
//         frm.set_value("remaining_item_serials", remaining_items);
//         frm.refresh_field("remaining_item_serials");
//     },
//     entered_item_serials: function(frm) {
//         frm.set_value("entered_item_serials", remaining_Entered_items);
//         frm.refresh_field("entered_item_serials");
//     },
//     film_width: function(frm, cdt, cdn) {
//         var d = locals[cdt][cdn];
//         if (d.sticker_roll_width) {
//             frappe.call({
//                 async: false,
//                 method: "alquds.alqudsQueries.get_Sticker",
//                 args: {
//                     rollWidth: d.sticker_roll_width,
//                     filmWidth: d.film_width
//                 },
//                 callback: function(r) {
//                     var images = []
//                     var stickers = r.message;
//                     stickers.forEach((obj)=>{
//                         images.push(obj.image);
//                     })
//                     set_field_options("stickers", images)
//                     // frm.selected_doc.sticker = r.message;
                    
//                 },
//             });
//         }
//         frm.refresh_field("image");
//     },
//     stickers:function(frm,cdt,cdn){
//         var d =locals[cdt][cdn]
//         d.sticker = d.stickers;
//         frm.refresh_field("sticker");
//         frm.refresh_field("image");
//     },
//     sticker_roll_width: function(frm, cdt, cdn) {
//         var d = locals[cdt][cdn];
//         if (d.film_width) {
//             frappe.call({
//                 async: false,
//                 method: "alquds.alqudsQueries.get_Sticker",
//                 args: {
//                     rollWidth: d.sticker_roll_width,
//                     filmWidth: d.film_width
//                 },
//                 callback: function(r) {
//                     var images = []
//                     var stickers = r.message;
//                     stickers.forEach((obj)=>{
//                         images.push(obj.image);
//                     })
//                     set_field_options("stickers", images)
//                     // frm.selected_doc.sticker = r.message;
                    
//                 },
//             });
//         }
//         frm.refresh_field("image");
//     },
// //     // thickness: function(frm, cdt, cdn) {
// //     //     var d = locals[cdt][cdn];
// //     //     frappe.call({
// //     //         async: false,
// //     //         method: "alquds.alqudsQueries.get_data_sheet",
// //     //         args: {
// //     //             Thickness: d.thickness,
// //     //         },
// //     //         callback: function(r) {
// //     //             if (r.message) {
// //     //                 console.log("sherif Nasser");
// //     //                 frm.selected_doc.s = r.message.S;
// //     //                 frm.selected_doc.cl = r.message.CL
// //     //                 frm.selected_doc.fe = r.message.Fe
// //     //                 frm.selected_doc.life_time = r.message.LifeTime
// //     //                 frm.refresh_field("s");
// //     //                 frm.refresh_field("cl");
// //     //                 frm.refresh_field("fe");
// //     //                 frm.refresh_field("life_time");
// //     //                 frm.set_df_property("s", "hidden", 0);
// //     //                 frm.set_df_property("cl", "hidden", 0);
// //     //                 frm.set_df_property("fe", "hidden", 0);
// //     //                 frm.set_df_property("life_time", "hidden", 0);
// //     //             } else {
// //     //                 console.log("Thickness value doesn't exist in Roll Details Doctype");
// //     //                 frm.set_df_property("s", "hidden", 1);
// //     //                 frm.set_df_property("cl", "hidden", 1);
// //     //                 frm.set_df_property("fe", "hidden", 1);
// //     //                 frm.set_df_property("life_time", "hidden", 1);
// //     //             }
// //     //         },
// //     //     });
// //     // },
//     generate: function(frm) {
//         //splittes the ref to get the item_serial then pass it to the backend function
//         // to get the default print format and pallet print format of the item
//         // var ref = "";
//         // var item_serial = "";
    
//         // $.each(frm.doc.product_details || [], function(i, row) {
//         //     ref = frm.doc.product_details[0].ref
 
//         // });

//         // if (ref != "") {
//         //     item_serial = ref.split('-')[0];
//         // }
       
        
//         // frappe.call({
//         //     method: "alquds.alqudsQueries.get_item_printformat",
//         //     args: {
//         //         item_serial: item_serial
//         //     },
//         //     callback: function(r) {
//         //         // console.log(r.message);
//         //         frm.doc.print_format = r.message[0];
//         //         frm.doc.pallet_print_format = r.message[1];
//         //         frm.refresh_field("print_format");
//         //         frm.refresh_field("pallet_print_format");
//         //     }
//         // });

//     },
// //     print_selected_pallet: function(frm) {
// //         // stop here
// // 	if(frm.doc.pallet_print_format){
// //         frappe.get_meta("Product Order").default_print_format = frm.doc.pallet_print_format;
// //     	}
// //     console.log(frappe.get_meta("Product Order"));
// //     console.log(frappe.get_meta("Product Order").default_print_format);

// //         is_doc_instantiated(frm);
// //         if (!frm.doc.docstatus)
// //             frm.doc.product_details.forEach((product) => {
// //                 frappe.model.set_value(
// //                     "Product Order Details",
// //                     product.name,
// //                     "item_status",
// //                     "Waiting Quality"
// //                 );
// //             });

// //         let d = new frappe.ui.Dialog({
// //             title: "Enter Pallet Number",
// //             fields: [{
// //                 label: "Pallet No",
// //                 fieldname: "pallet_no",
// //                 fieldtype: "Data"
// //             }, ],
// //             primary_action_label: "Print",
// //             primary_action(values) {
// //                 var pallets = "";
// //                 if(values.pallet_no.includes(',')){
// //                      pallets = values.pallet_no.split(',');
// //                      pallets.forEach((palletNo) =>{
// //                         print_selected_doc(frm,palletNo);
// //                     })
                
// //                 }else{
// //                     pallets = values.pallet_no;
// //                     print_selected_doc(frm,pallets);
                
// //                 }
                
// //                 // frm.doc.selected_pallet_no = values.sap_pallet_no;
                
// //                 d.hide();
// //                 // frm.print_doc();
                
// //             },
// //         });

// //         d.show();

// //         function print_selected_doc(frm,palletref) {
           
           
// //             // frm.doc.selected_product = [];
// //             let i = 1;
// //             frm.doc.product_details.forEach((product) => {
// //                 if (product.pallet_no == palletref) {
// //                     frm.doc.selected_product.push({
// //                         ...product,
// //                         idx: i
// //                     });
// //                     i += 1;
// //                 }
// //             });
// //             frm.refresh_field("selected_product");
// //             frm.print_doc();
// //         }
// //     },

// });

// // /// END Product Order  /// 



// // /// Product Order Details  /// 

// // frappe.ui.form.on("Product Order Details", {

//     gross_weight: function(frm,cdt,cdn) {
//         var d = locals[cdt][cdn]
//         var totalQTY = frm.doc.quantity;
//         var totalGrossWeight = 0.0;

//         $.each(frm.doc.product_details || [], function(i, row) {
//             if (row.gross_weight) {
//                 totalGrossWeight += flt(row.gross_weight);
//                 totalGross = totalGrossWeight;
//             }
//             if (row.idx > (row.idx) - 1) {
//                 all_rows = row.idx;
//             }
//         });
//         remaining_items = all_rows - d.idx;
//         remaining_Entered_items = d.idx;

//         if ((totalQTY >= totalGross) && (frm.doc.weight_type == "ÙˆØ²Ù† Ù‚Ø§Ø¦Ù…")) {
//             console.log(frm.doc.weight_type);
//             remaining_reqd_weight = totalQTY - totalGross
//             frm.trigger("remaining_from_qt");
//         }

//         frm.trigger("gross_weight_sum");
//         frm.trigger("remaining_item_serials");
//         frm.trigger("entered_item_serials");

//     },
//     net_weight: function(frm) {
//         var totalQTY = frm.doc.quantity;
//         console.log(totalQTY);
//         console.log(frm.doc.weight_type);
//         var totalNetWeight = 0.0;
//         $.each(frm.doc.product_details || [], function(i, row) {
//             if (row.net_weight) {
//                 totalNetWeight += flt(row.net_weight);
//                 totalNet = totalNetWeight;
//             }
//         });

//         if ((totalQTY >= totalNet) && (frm.doc.weight_type == "ÙˆØ²Ù† ØµØ§ÙÙ‰")) {

//             remaining_reqd_weight = totalQTY - totalNet
//             frm.trigger("remaining_from_qt");
//             console.log("inside net weight ");
//         }
//         frm.trigger("net_weight_sum");

//     },
   

// // });


// // function is_doc_instantiated(frm) {
// //     // let name = frm.doc.name.split("-");
// //     if (frm.doc.__unsaved) frappe.throw("Save the Doc to generate qr code");
// //   }

// // /// Product Order Details  ///