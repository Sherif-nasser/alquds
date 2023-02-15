
var realStatus_Quality_Inspection = "";


///Quality Inspection /// 

frappe.ui.form.on("Quality Inspection", {
    onload_post_render: function (frm) {
      
      if (frm.is_new() && frappe.get_prev_route()[1] == "Quality Control") {
        var roll_number = (frappe._from_link.doc.sap_serial_no).split('/')[1];
        var pallet_number = (frappe._from_link.doc.sap_pallet_no).split('/')[1];
        var production_number = (frappe._from_link.doc.sap_serial_no).split('/')[0];
        try {
          frm.set_value("item_code", frappe._from_link.doc.item_serial);
          frm.set_value("reference_type", "Product Order");
          frm.set_value("reference_name", frappe._from_link.doc.product_name);
          frm.set_value("sap_serial_number", frappe._from_link.doc.sap_serial_no);
          frm.set_value("roll_no", roll_number);
          frm.set_value("pallet_no", pallet_number);
          frm.set_value("production_no", production_number);
        } catch (e) {}
      }

      if(frm.doc.item_code && frm.doc.type == "صالة"){
          try{
            var itemCode = frm.doc.item_code;
            if(itemCode){
              frappe.call({
                method: 'alquds.alqudsQueries.get_Item_inspection_Template',
                args:{
                  itemName : itemCode
                },
                callback: function(r) {
                  const inspection_template = (r.message)[1];
                  frm.set_value('quality_inspection_template',inspection_template);
                }
              });
              frm.refresh_field("quality_inspection_template");
            }
            
            // var item_inspection_template = frappe.db.get_value('Item', {'item_name': itemCode}, 'quality_inspection_template_lab')
        }catch(e){
          console.log(e.message);
        }
      }
    },
    // before_save: function (frm) {
      
    //   frappe.set_route("/app/quality-control");
    // },
    status:function(frm){
      realStatus_Quality_Inspection = frm.selected_doc.status;
    },
    after_save: function(frm){
      frappe.set_route("/app/quality-inspection/"+frm.doc.name);
      if(frm.selected_doc.status == "Accepted"){
        frm.selected_doc.status = realStatus_Quality_Inspection;
        // console.log(frm.selected_doc.status)
      }else{
        frm.selected_doc.status = realStatus_Quality_Inspection;
      }
      // frm.selected_doc.status = realStatus_Quality_Inspection;
    },
    on_submit:function(frm){
      frappe.set_route("/app/quality-control");
    },
    type:function(frm,cdt,cdn){
      var d = locals[cdt][cdn];
        if(d.type == "معملي"){
          try{
            var itemCode = frm.doc.item_code;
            if(itemCode){
              frappe.call({
                method: 'alquds.alqudsQueries.get_Item_inspection_Template',
                args:{
                  itemName : itemCode
                },
                callback: function(r) {
                  const inspection_template = (r.message)[0];
                  frm.set_value('quality_inspection_template',inspection_template);
                }
              });
              frm.refresh_field("quality_inspection_template");
              
              frm.refresh_field("readings");
            }
            // var item_inspection_template = frappe.db.get_value('Item', {'item_name': itemCode}, 'quality_inspection_template_lab')
        }catch(e){
          console.log(e.message);
        }
      }
      if(d.type == "صالة"){
        try{
          var itemCode = frm.doc.item_code;
          if(itemCode){
            frappe.call({
              method: 'alquds.alqudsQueries.get_Item_inspection_Template',
              args:{
                itemName : itemCode
              },
              callback: function(r) {
                const inspection_template = (r.message)[1];
                frm.set_value('quality_inspection_template',inspection_template);
              }
            });
            frm.refresh_field("quality_inspection_template");
            frm.refresh_fields("readings");
           
            
          }
          // var item_inspection_template = frappe.db.get_value('Item', {'item_name': itemCode}, 'quality_inspection_template_lab')
      }catch(e){
        console.log(e.message);
      }
      }
      
    }
  
  });
  
  /// END Quality Inspection /// 
  