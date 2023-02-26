

/// Quality Control  /// 
frappe.ui.form.on('Quality Control', {
    onload:function(frm,cdt,cdn){
      frm.fields_dict["product_items"].grid.get_field("qt_inspection_yard").get_query =
      function (doc, cdt, cdn) {
        var child = locals[cdt][cdn];
        return {
          filters: [
            ["sap_serial_number", "=", child["sap_serial_no"]],
            ["type", "=", "صالة"],
            ["docstatus", "=", "1"]
          
          ],
        };
      };

      frm.fields_dict["product_items"].grid.get_field("qt_inspection_lab").get_query =
      function (doc, cdt, cdn) {
        var child = locals[cdt][cdn];
        return {
          filters: [
            ["sap_serial_number", "=", child["sap_serial_no"]],
            ["type", "=", "معملي"],
            ["docstatus", "=", "1"]
          
          ],
        };
      };
      
        // frm.fields_dict["product_items"].grid.get_field("qt_inspection").get_query =
        // function (doc, cdt, cdn) {
        //   var child = locals[cdt][cdn];
        //   return {
        //     filters: [["sap_serial_number", "=", child["sap_serial_no"]]],
        //   };
        // };
      
    },
    change_item_status: function (frm,cdt,cdn) {
      var productItems = locals[cdt][cdn].product_items;
        for(var i=0;i<productItems.length;i++){
          // if(productItems[i].qt_status_yard ==  productItems[i].qt_status_lab){
          //   productItems[i].final_status = productItems[i].qt_status_yard;
          //   console.log(productItems[i].final_status);
          // }

          // if(productItems[i].qt_status_yard ==  "غير مطابق" || productItems[i].qt_status_lab == "غير مطابق"){
          //   productItems[i].final_status = "غير مطابق";
          //   console.log(productItems[i].final_status);
          // }

          if(productItems[i].final_status != "None"){
            productItems[i].quality_status = productItems[i].final_status
            frappe.call({
              method: "alquds.alqudsQueries.update_item_quality_quds",
              args: {
                name: productItems[i].item_name,
                status: productItems[i].quality_status,
                qt_inspection: productItems[i].qt_inspection || "",
                qt_lab : productItems[i].qt_inspection_lab,
                qt_yard: productItems[i].qt_inspection_yard,
                qt_Status_Lab:productItems[i].qt_status_lab,
                qt_Status_Yard:productItems[i].qt_status_yard,
              },
            });
          }
        }
      frm.reload_doc();
    }
});


/// END Quality Control  /// 


/// Quality Control Details  ///

frappe.ui.form.on('Quality Control Details', {
  // qt_status_yard:function(frm,cdt,cdn){
  //     var childitem = locals[cdt][cdn];
  //     if(frm.selected_doc.qt_status_lab == "مطابق" && frm.selected_doc.qt_status_yard == "مطابق"){
  //         childitem.final_status="مطابق";
  //         frm.refresh_field('product_items');
  //     }
  // },
  final_status:function(frm,cdt,cdn){
      var childitem = locals[cdt][cdn];
      frm.refresh_field('product_items');
      
      childitem.qt_status_lab=frm.selected_doc.final_status;
      childitem.qt_status_yard=frm.selected_doc.final_status;
      frm.refresh_field('product_items');
      
  },

  // set the qt lab status
  qt_inspection_lab: function (frm,cdt,cdn) {
    
    frm.refresh_field('product_items');
    if(frm.selected_doc.qt_status_lab == "مطابق" && frm.selected_doc.qt_status_yard == "مطابق"){
      console.log(frm.selected_doc.qt_status_yard + "from the edits");
      frappe.model.set_value(
        "Quality Control Details",
        frm.selected_doc.name,
        "final_status",
        frm.selected_doc.qt_status_lab
      );
      // frm.selected_doc.set_value("final_status","مطابق");
      frm.refresh_field('product_items');
    }

      if (frm.selected_doc.qt_inspection_lab) {
        frappe.call({
          method: "frappe.client.get",
          args: {
            doctype: "Quality Inspection",
            name: frm.selected_doc.qt_inspection_lab,
            filters: [
              "type", "=", "معملي"
            ]
  
          },
          callback: function (r) {
            frappe.model.set_value(
              "Quality Control Details",
              frm.selected_doc.name,
              "qt_status_lab",
              r.message.status
            );
            refresh_field("product_items");
          },
        });
      }
    },

    // set the qt yard status
  qt_inspection_yard: function (frm,cdt,cdn){
    frm.refresh_field('product_items');
      if (frm.selected_doc.qt_inspection_yard) {
        try{
          frappe.call({
            method: "frappe.client.get",
            args: {
              doctype: "Quality Inspection",
              name: frm.selected_doc.qt_inspection_yard,
              filters: [
                "type", "=", "صالة"
              ]
            },
            callback: function (r) {
                frappe.model.set_value(
                  "Quality Control Details",
                  frm.selected_doc.name,
                  "qt_status_yard",
                  r.message.status
            
                );
                console.log(r.message.status);
              refresh_field("product_items");
            },
          });
        }catch(e){
          console.log(e.message);
        }
          
        }
  },
  change_item_status: function (frm,cdt,cdn) {
    var d = locals[cdt][cdn];
    if(d.final_status != "None"){
      d.quality_status = d.final_status
      frappe.call({
        method: "alquds.alqudsQueries.update_item_quality_quds",
        args: {
          name: d.item_name,
          status: d.quality_status,
          qt_inspection: d.qt_inspection || "",
          qt_lab : d.qt_inspection_lab,
          qt_yard: d.qt_inspection_yard,
          qt_Status_Lab:d.qt_status_lab,
          qt_Status_Yard:d.qt_status_yard,
        },
      });
    }else{
      frappe.msgprint(" Final status for this item is None");
    }
  
  }
  

})

/// END Quality Control Details  ///


