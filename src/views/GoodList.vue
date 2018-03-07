<template>
  <div>
`       <header-comp></header-comp>
        <nav-bread>
          <span>Goods</span>
        </nav-bread>
        <div class="accessory-result-page accessory-page">
          <div class="container">
            <div class="filter-nav">
              <span class="sortby">Sort by:</span>
              <a href="javascript:void(0)" v-bind:class="{'cur':isDefault}" @click="isDefault=true">Default</a>
              <a class="price"@click="sortGoods"v-bind:class="{'cur':!isDefault}">Price <svg class="icon icon-arrow-short sort-up"v-bind:class="{'sort-up':sortFlag==1?true:false}"><use  xlink:href="#icon-arrow-short"></use></svg></a>
              <a href="javascript:void(0)" class="filterby stopPop">Filter by</a>
            </div>
            <div class="accessory-result">
              <!-- filter -->
              <div class="filter stopPop" id="filter">
                <dl class="filter-price">
                  <dt>Price:</dt>
                  <dd><a href="javascript:void(0)"@click="setPriceFilter('all')">All</a></dd>
                  <dd v-for="(item,index) in priceFilter"@click="setPriceFilter(index)">
                    <a  >{{parseInt(item.startPrice)}} - {{parseInt(item.endPrice)}}</a>
                  </dd>

                </dl>
              </div>

              <!-- search result accessories list -->
              <div class="accessory-list-wrap">
                <div class="accessory-list col-4">
                  <ul>
                    <li v-for="item in goodList">
                      <div class="pic">
                        <a href="#"><img :src="'/static/'+item.productImage" alt=""></a>
                      </div>
                      <div class="main">
                        <div class="name">{{item.productName}}</div>
                        <div class="price">{{item.salePrice}}</div>
                        <div class="btn-area">
                          <a href="javascript:;"@click="addCart(item.productId)" class="btn btn--m">加入购物车</a>
                        </div>
                      </div>
                    </li>
                  </ul>
                  <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
                    <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    <modal v-bind:mdShow="mdShow"v-on:close="closeModal">
      <p slot="message">请先登录,否则无法加入购物车!</p>
      <div slot="btnGroup"><a class="btn btn--m" href="javascript:;" @click="closeModal">关闭</a></div>
    </modal>
    <modal v-bind:mdShow="mdShowCart"v-on:close="closeModal">
      <p slot="message">
        <svg class="icon-status-ok">
          <use xmlns:xlink="http://www.w3.org/1999/xlink"xlink:href="#icon-cart"></use>
        </svg>
        <span>加入购物车成功！</span>
      </p>
      <div slot="btnGroup">
        <a class="btn btn--m" href="javascript:;"@click="updateCart">继续购物</a>
        <router-link class="btn btn--m"href="javascript:;"to="/cart">查看购物车</router-link>
      </div>
    </modal>
   <footer-comp></footer-comp>
  </div>
</template>

<script>
  import './../assets/css/base.css'
  import './../assets/css/product.css'
  import HeaderComp from '@/components/Header.vue'
  import FooterComp from '@/components/Footer.vue'
  import NavBread from "@/components/NavBread"
  import Modal from "@/components/Modal"
  import axios from "axios"
    export default {
      data(){
        return {
          goodList:[],
          sortFlag:true,
          page:1,
          pageSize:8,
          busy:true,
          loading:false,
          mdShow:false,
          mdShowCart:false,
          isDefault:true,
          priceFilter:[
            {
              startPrice:'0.00',
              endPrice:'100.00'
            },
            {
              startPrice:'100.00',
              endPrice:'500.00'
            },
            {
              startPrice:'500.00',
              endPrice:'1000.00'
            },
            {
              startPrice:'1000.00',
              endPrice:'2000.00'
            }
          ],
          priceChecked:'all'
        }
      },
  mounted(){
    this.getGoodList();
    },
  components:{
          NavBread,
          HeaderComp,
          FooterComp,
          Modal
        },
      methods:{
        getGoodList(flag){
          var param={
            page:this.page,
            pageSize:this.pageSize,
            sort:(this.sortFlag?1:-1),
            priceLevel:this.priceChecked
          }
          this.loading=true;
          axios.get("/goods/list",{
            params:param
          }).then((res)=>{
            this.loading=false;
            let re=res.data;
            console.log(re);
            if(re.status==='0'){
              if(flag){
              this.goodList= this.goodList.concat( this.goodList=re.result.list);
                if(re.result.count==0){

                  this.busy=true;
                }else{
                  this.busy=false;

                }
              }else{
                this.goodList= this.goodList=re.result.list;
                this.busy=false;

              }


            }else{
              goodList={};
            }
          })
        },
        sortGoods(){
          this.isDefault=false;
        this.sortFlag =!this.sortFlag;
        this.page=1;
        this.getGoodList();
        },
        setPriceFilter(index){
          console.log(index);
          this.priceChecked=index;
          this.page=1;
          this.getGoodList();
        },
        loadMore(){

          this.busy=true;
          setTimeout(()=>{
            this.page++;
            this.getGoodList(true);
          },500)
        },
        addCart(productId,userId){
            axios.post("/goods/addCart",{
              productId,
              userId
            }).then((response)=>{
             let res=response.data;
             console.log(res);
              if(res.status=='0'){
                this.mdShowCart=true;
              }else{
               this.mdShowCart=false;
              }
            })
        },
        closeModal(){
          this.mdShow=false;

        },
        updateCart(){
          this.mdShowCart=false;
          axios.get("/users/getCartCount").then((response)=>{
            let res=response.data;
            console.log(res.result);
            this.$store.commit("initCartCount",res.result);
          });
        }

      }

    }
</script>
