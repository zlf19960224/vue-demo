var express=require("express");
var router =express.Router();
var mongoose=require('mongoose');
var Goods=require('../models/goods');
//链接mongodb数据库\
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/mall',{useMongoClient: true});
mongoose.connection.on("connected",function(){
  console.log('sus');
});
mongoose.connection.on("error",function(){
  console.log('err');
});
mongoose.connection.on("disconnected",function(){
  console.log('dis');
});
router.get('/list',function(req,res,next){
  var page=parseInt(req.param("page"));
  var pageSize=parseInt(req.param("pageSize"));
  var sort =parseInt(req.param("sort"));
  var priceLevel=req.param("priceLevel");
 var priceGt='',priceLte='';
  var params={};
    if(priceLevel !='all'){
    switch(priceLevel){
      case '0': priceGt=0;priceLte=100;break;
      case '1': priceGt=1000;priceLte=500;break;
      case '2': priceGt=500;priceLte=1000;break;
      case '3': priceGt=1000;priceLte=2000;break;
    }
      params={
        salePrice:{
          $gt:priceGt,
          $lte:priceLte
        }
      }
  }



  var skip=(page-1)*pageSize;

  var goodsModel=Goods.find(params).skip(skip).limit(pageSize);
  goodsModel.sort({'salePrice':sort});
  goodsModel.exec(function(err,doc){
    if(err){
      console.log(err);
      res.json({
        status:'1',
        msg:err.message
      });
    }else{
      console.log(1);
      res.json({
        status:'0',
        msg:'',
        result:{
          count:doc.length,
          list:doc
        }
      })


    }
  });
});
//加入购物车
router.post("/addCart",function(req,res,next){
  var userId=req.cookies.userId,productId=req.body.productId;
  console.log(userId);
  var User=require('../models/users');
  User.findOne({userId},function(err,userDoc){
      if(err){

        res.json({
          status:'1',
          msg:err.message
        })
      }else{
        if(userDoc){
          var goodsItem='';
          console.log(userDoc);
          userDoc.cartList.forEach(function(item){
            if(item.productId===productId){
              goodsItem=item;
              item.productNum++;
            }
          });
          if(goodsItem){
            userDoc.save(function(err2,doc2){
              if(err2){

                res.json({
                  status:'1',
                  msg:err2.message
                });
              }else{
                res.json({
                  status:'0',
                  msg:'',
                  result:'suc'
                })
              }
            })
          }else{
            Goods.find({productId},function(err,doc){
              if(err){

                res.json({
                  status:'1',
                  msg:err.message,
                  result:""
                });
              }else{
                if(doc){
                  console.log(doc);
                  doc[0].productNum=1;
                  doc[0].checked=1;
                  userDoc.cartList.push(doc[0]);
                  userDoc.save(function(err2,doc2){
                    if(err2){

                      res.json({
                        status:'1',
                        msg:err2.message
                      });
                    }else{
                      res.json({
                        status:'0',
                        msg:'',
                        result:'suc'
                      })
                    }
                  })
                }
              }
            })
          }

        }
      }
  })
})
module.exports=router;
