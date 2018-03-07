var express = require('express');
var router = express.Router();
var User=require("../models/users");
require("./../util/util")
router.post("/login",function(req,res,next){

  var param={
    userName:req.body.userName,
    userPwd:req.body.userPwd
  };

User.find(param,function(err,doc){
    if(err){
      res.json({
        status:'0',
        msg:err.message
      })

    }else{
        if(doc){
          res.cookie("userId",doc[0].userId,{
            path:'/',
            maxAge:1000*60*60
          });
          res.cookie("userName",doc[0].userName,{
            path:'/',
            maxAge:1000*60*60
          });
          // req.session.user=doc;
          res.json({
            status:'1',
            msg:'',
            result:{
              userName:doc[0].userName
            }
          })

        }

    }
  })
});
//登出
router.post("/logout",function(req,res,next){
  res.cookie("userId","",
    {
      path:"/",
      maxAge:-1
    });
res.json({
  status:"0",
  msg:"",
  result:""
})
});
router.get("/checkLogin",function(req,res,next){
  if(req.cookies.userId){
    res.json({
      status:"0",
      msg:"",
      result:req.cookies.userName||""
    })
  }else{
    res.json({
      status:"1",
      msg:"未登录",
      result:""
    })
  }
});
//查询当前用户购物车
router.get("/cartList",function(req,res,next){
  var userId=req.cookies.userId;
  User.find({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      });
    }else{
      if(doc){
        res.json({
          status:"0",
          msg:'',
          result:doc[0].cartList
        })
      }
    }
  })
});
//删除购物车
router.post("/cartDel",function(req,res,next){
  var userId=req.cookies.userId,productId=req.body.productId;

  User.update({userId:userId}, {
    $pull:{
      "cartList":
        {'productId':productId}}
  },function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      })
    }else{
      res.json({
        status:"0",
        msg:'',
        result:"suc"
      })
    }
  });
});
router.post("/cartEdit",function(req,res,next){
  var userId=req.cookies.userId,productId=req.body.productId,productNum=req.body.productNum,checked=req.body.checked;
  User.update({"userId":userId,"cartList.productId":productId},{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked,
  },function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      })
    }else{
      if(doc){
      res.json({
        status:"0",
        msg:'',
        result:"suc"
      })
    }
    }
  })
})
router.post("/editCheckAll",function(req,res,next){
  var userId=req.cookies.userId,
    checkAll=req.body.checkAll?"1":"0";
  User.find({userId},function(err,user){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:""
      })
    }else{
      if(user){

        user[0].cartList.forEach((item)=>{
          item.checked=checkAll;
        })
        user[0].save(function(err1,doc){
          if(err){
            res.json({
              status:"1",
              msg:err.message,
              result:""
            })
          }else{
            res.json({
              status:"0",
              msg:"",
              result:"suc"
            })
          }
        })
      }
    }
  });
});
router.get("/addressList",function(req,res,next){
  var userId=req.cookies.userId;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:"1",
        msg:err.message,
        result:''
      })
    }else{
      res.json({
        status:'0',
        msg:'',
        result:doc.addressList
      })
    }
  })
})
//设置默认地址j接口
router.post("/setDefault",function(req,res,next){
  var userId=req.cookies.userId,addressId=req.body.addressId;
  User.findOne({userId:userId},function(err,doc) {
    if (err) {
      res.json({
        status: "1003",
        msg: err.message,
        result: ''
      })
    } else {
      var addressList = doc.addressList;
      addressList.forEach((item) => {
        if(item.addressId==addressId){
          item.isDefault=true;
        }else{
          item.isDefault=false;
        }
      })
    }
    doc.save(function(err1,doc1){
      if (err1) {
        res.json({
          status: "1",
          msg: err1.message,
          result: ''
        })
      }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        })
      }
    })
  })

});
router.post("/delAddress",function(req,res,next){
  var userId=req.cookies.userId ,addressId=req.body.addressId;
  User.update({
    userId:userId
  },{
    $pull:{
      'addressList':{
        "addressId":addressId
      }
    }
    },function(err,doc){
      if(err){
        res.json({
          status:'1',
          msg:err.message,
          result:''
        })
      }else{
        res.json({
          status:'0',
          msg:'',
          result:''
        })
      }
    }
  )
});
router.post("/payMent",function(req,res,next){
  var userId=req.cookies.userId ,addressId=req.body.addressId,orderTotal=req.body.orderTotal;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      var address='',goodList=[];
      console.log(doc);
        doc.addressList.forEach((item)=>{
          if(addressId==item.addressId&&item.isDefault){
            address=item;
          }
      });
      doc.cartList.filter((item)=>{
        if(item.checked=='1'){
          goodList.push(item);
        }
      });
      var platform="622";
      var r1=Math.floor(Math.random()*10);
      var r2=Math.floor(Math.random()*10);
      var sysDate=new Date().Format("yyyyMMddhhmmss");
      var createDate=new Date().Format('yyyy-MM-dd hh:mm:ss');
      var orderId=platform+r1+sysDate+r2;
      var order={
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodList:goodList,
        orderStatus:'1',
        createDate:createDate
      }
      console.log(doc);
      doc.orderList.push(order);
      doc.save(function(err1,doc1){
        if(err1){
          res.json({
            status:'1',
            msg:err.message,
            result:''
          })
        }else{
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          })
        }
      })
    }
  })
});
router.get("/orderDetail",function(req,res,next){
  var userId=req.cookies.userId ,orderId=req.param("orderId");
  console.log(req.param("orderId"));
  User.findOne({
    userId:userId
  },function(err,userInfo){
      if(err){
        res.json({
          status:"1",
          msg:err.message,
          result:""
        })
      }else{
        var orderList=userInfo.orderList;
        if(orderList.length>0){
          var orderTotal=0;
          console.log(orderList);
          orderList.forEach((item)=>{
            console.log(item);
            if(orderId==item.orderId){
              orderTotal=item.orderTotal;
            }
          })
            if(orderTotal>0){
              res.json({
                status:'0',
                msg:'',
                result:{
                  orderId:orderId,
                  orderTotal:orderTotal
                }
              })
            }else{
              res.json({
                status:"120002",
                msg:'无此订单',
                result:''
              })
            }


        }else{
          res.json({
            status:"120001",
            msg:'当前用户未创建订单',
            result:''
          })
        }
      }
  })
});
router.get("/getCartCount",function(req,res,next){
  if(req.cookies&&req.cookies.userId){
    var userId=req.cookies.userId;
    User.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:"1",
          msg:err.message,
          result:""
        })
      }else{
        var cartList=doc.cartList;
        var cartCount=0;
        cartList.map(function(item){
          cartCount+=parseInt(item.productNum);

        })
        res.json({
          status:'0',
          msg:'',
          result:cartCount
        })
      }
    })
  }
});
router.post("/Register",function(req,res,next){
  var rUserName=req.body.rUserName,rUserPwd=req.body.rUserPwd;
  var platform="chd";
  var r1=Math.floor(Math.random()*10000);
  var r2=Math.floor(Math.random()*10000);
  var userId=platform+r1+r2;
  var user=new User({
    userName:rUserName,
    userPwd:rUserPwd,
    userId:userId,
    orderList:[],
    addressList:[],
    cartList:[]
  });
  User.findOne({
    userName:rUserName
  },function(err,doc){
    if(err){
      res.json({
      status:'1',
      msg:err.message,
      result:'注册失败'
      });

    }else if(doc){

      res.json({
        status:'10009',
        msg:'',
        result:'此用户名已存在'
      })
    }else{
      user.save(function(err1,doc1) {
        if (err1) {
          res.json({
            status:'1',
            msg:err.message,
            result:'注册失败'
          });
        }else {
          res.json({
            status: '0',
            msg:'',
            result: '注册成功'
          });
        }
      });
    }
  })
});
router.post("/addAddress",function(req,res,next){
    var addAddress=req.body.addAddress;
 var userId=req.cookies.userId;
 User.findOne({userId:userId},function(err,doc){
   if(err){
     res.json({
       status:'1',
       msg:err.message,
       result:''
     });

   }else{
     doc.addressList.push(addAddress);
     doc.save(function(err1,doc1){
       if(err1){
         res.json({
           status:'1',
           msg:err1.message,
           result:''
         });
       }else{
         res.json({
           status:'0',
           msg:'',
           result:''
         });
       }
     })
   }
   })
});
module.exports = router;
