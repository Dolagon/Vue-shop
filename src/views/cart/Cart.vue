<template>
  <!--!userInfo.token-->
  <div id="cart" v-if="userInfo.token">
    <!--头部区域-->
    <header class="titleWrapper">
      <h4><strong>购物车</strong></h4>
      <button class="clearCart" @click="clearCart">清空购物车</button>
    </header>
    <div class="contentWrapper">
      <!--中间内容-->
      <main class="contentWrapperList">
        <div v-if="goodsCount === 0">
          <p style="display: flex;justify-content: center;align-items: center;margin-top: 100px;">购物车是空的</p>
          <img style="position:absolute;left: 50%;top: 40%;transform: translate(-50%)" src="./images/nothing.png" alt="nothing">
        </div>
        <div v-else>
          <section>
            <div
                class="shopCartListCon"
                v-for="(goods, index) in shopCart"
                :key="goods.id"
            >
              <div class="left">
                <a
                    href="javascript:;"
                    class="cartCheckBox"
                    :checked="goods.checked"
                    @click.stop="singerGoodsSelected(goods.id)"
                ></a>
              </div>
              <div class="center">
                <img :src="goods.small_image" alt="">
              </div>
              <div class="right">
                <a href="#">{{ goods.name }}</a>
                <div class="bottomContent">
                  <p class="shopPrice">{{ goods.price | moneyFormat }}</p>
                  <div class="shopDeal">
                    <span @click="removeOutCart(goods.id, goods.num)">-</span>
                    <input disabled type="number" v-model="goods.num">
                    <span @click="addToCart(goods.id, goods.name, goods.small_image, goods.price)">+</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <!--底部通栏-->
      <div class="tabBar">
        <div class="tabBarLeft">
          <a
              href="javascript:;"
              class="cartCheckBox"
              :checked="isSelectedAll"
              @click.stop="selectedAll(isSelectedAll)"
          ></a>
          <span style="font-size: 16px;">全选</span>
          <div class="selectAll">
            合计：<span class="totalPrice">{{ totalPrice | moneyFormat }}</span>
          </div>
        </div>
        <div class="tabBarRight">
          <button class="pay" @click="toPay">去结算({{ goodsCount }})</button>
        </div>
      </div>
    </div>
  </div>
  <SelectLogin v-else></SelectLogin>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import {Dialog, Toast} from 'vant';
import SelectLogin from "../login/SelectLogin";
import {changeCartNum, clearAllCart, singerGoodsSelect, allGoodsSelect} from '../../service/api/index'

export default {
  name: "Cart",
  components: {
    SelectLogin
  },
  data() {
    return {
      nothing: 0
    }
  },
  computed: {
    // 取自 store/state
    ...mapState(["shopCart", 'userInfo']),
    // 0. 商品总件数
    goodsCount() {
      let selectGoodsCount = 0;
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (goods.checked) {  // 选中时计算
          selectGoodsCount += 1;
        }
      });
      return selectGoodsCount;
    },
    // 1. 商品是否全选
    isSelectedAll() {
      let goodsCount = Object.keys(this.shopCart).length;
      let tag = goodsCount > 0;  // 有商品选中
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (!goods.checked) {
          tag = false;
        }
      });
      return tag;
    },
    // 2. 计算商品总价
    totalPrice() {
      let totalPrice = 0;
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (goods.checked) {  // 选中时计算
          totalPrice += goods.price * goods.num;
        }
      });
      return totalPrice;
    }
  },
  methods: {
    ...mapMutations([
      "REDUCE_CART",
      "ADD_GOODS",
      "SELECTED_SINGER_GOODS",
      "SELECTED_All_GOODS",
      "CLEAR_CART"
    ]),
    // 1. 移除购物车
    async removeOutCart(goodsId, goodsNum) {
      if (goodsNum > 1) {
        let result = await changeCartNum(this.userInfo.token, goodsId, 'reduce');
        if (result.success_code === 200) {  // 修改成功
          this.REDUCE_CART({goodsId});
        } else {
          Toast({
            message: '状态异常!',
            duration: 500
          });
        }
      } else if (goodsNum === 1) {  // 保留提示
        Dialog.confirm({
          title: '提示',
          message: '确定删除该商品吗',
        }).then(async () => {  // 确定删除
          let result = await changeCartNum(this.userInfo.token, goodsId, 'reduce');
          if (result.success_code === 200) {  // 修改成功
            this.REDUCE_CART({goodsId});
          } else {
            Toast({
              message: '状态异常!',
              duration: 500
            });
          }
        }).catch(() => {  // 取消
          // do nothing
        });
      }
    },
    // 2. 增加商品
    async addToCart(goodsId, goodsName, smallImage, goodsPrice) {
      let result = await changeCartNum(this.userInfo.token, goodsId, 'add');
      if (result.success_code === 200) {  // 修改成功
        this.ADD_GOODS({
          goodsId,
          goodsName,
          smallImage,
          goodsPrice
        });
      } else {
        Toast({
          message: '状态异常!',
          duration: 500
        });
      }
    },
    // 3. 单个商品选中和取消选中
    async singerGoodsSelected(goodsId) {
      let result = await singerGoodsSelect(this.userInfo.token, goodsId);
      if (result.success_code === 200) {
        this.SELECTED_SINGER_GOODS({goodsId});
      }
    },
    // 4. 全选和取消全选
    async selectedAll(isSelected) {
      let result = await allGoodsSelect(this.userInfo.token, isSelected);
      if (result.success_code === 200) {
        this.SELECTED_All_GOODS({isSelected});
      }
    },
    // 5, 清空购物车
    clearCart() {
      Dialog.confirm({
        title: '提示',
        message: '确定清空购物车吗',
      }).then(async() => {  // 确定删除
        let result = await clearAllCart(this.userInfo.token);
        console.log(result);
        if (result.success_code === 200) {  // 删除成功
          this.CLEAR_CART();
        } else {
          Toast({
            message: '状态异常!',
            duration: 500
          });
        }
      }).catch(() => {  // 取消
        // do nothing
      });
    },
    // 6. 去支付
    toPay() {
      if (this.totalPrice > 0) {
        this.$router.push('/confirmOrder');
      } else {
        Toast({
          message: '请选择商品后结算',
          duration: 600
        });
      }
    }
  }
}
</script>

<style scoped>
  #cart{
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
  }

  .titleWrapper{
    width: 100%;
    height: 2.6rem;
    background: #fff;
    -webkit-background-size: 0.1rem 4.4rem;
    background-size: 0.1rem 4.4rem;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  .titleWrapper .clearCart {
    background-color: transparent;
    position: absolute;
    right: 0.3rem;
    color: red;
    font-size: 0.8rem;
  }
  .contentWrapper{
    padding-top: 3.5rem;
  }

  .contentWrapperList{
    padding-bottom: 6rem;
  }

  .contentWrapperList section{
    background-color: #fff;
  }

  .cartCheckBox{
    background: url("./images/shop-icon.png") no-repeat;
    -webkit-background-size: 2.5rem 5rem;
    background-size: 2.5rem 5rem;
    width: 1rem;
    height: 1rem;
  }

  .cartCheckBox[checked]{
    background-position: -1.2rem 0;
  }

  .shopCartListCon{
    display: flex;
    height: 6rem;
    border-bottom:  0.01rem solid #e0e0e0;
    margin-bottom: 0.7rem;
    padding: 0.5rem 0;
  }

  .shopCartListCon .left{
    /*background: purple;*/
    flex: 1;
    display: flex;
    /*justify-content: center;*/
  }

  .shopCartListCon .left a{
    display: inline-block;
    margin-top: 0.8rem;
    margin-left: 0.5rem;
  }


  .shopCartListCon .center{
    /*background: blue;*/
    flex: 3;
  }

  .shopCartListCon .center img{
    width: 100%;
    height: 100%;
  }

  .shopCartListCon .right{
    /*background: orangered;*/
    flex: 6;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 0.5rem;
    margin-right: 0.5rem;

    position: relative;
  }

  .shopCartListCon .right a{
    height: 2.2rem;
    line-height: 1.2rem;
    overflow: hidden;
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
    color: #000;
  }

  .shopCartListCon .bottomContent{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .shopCartListCon .bottomContent .shopPrice{
    font-size: 0.8rem;
  }

  .shopCartListCon .right .shopDeal span{
    display: inline-block;
    width: 1rem;
    height: 1.2rem;
    line-height: 1.2rem;
    text-align: center;
    float: left;
  }

  .shopCartListCon .right .shopDeal input{
    float: left;
    width: 2rem;
    height: 1.2rem;
    text-align: center;
    margin: 0 0.2rem;
    font-size: 0.8rem;
  }

  /*底部通栏*/
  .tabBar{
    position: fixed;
    left:0;
    bottom:2.7rem;
    width:100%;
    height: 2.5rem;
    background-color: #fff;

    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 0.01rem solid #e0e0e0;
  }

  .tabBarLeft{
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
  }

  .tabBarLeft .selectAll{
    margin-left: 1rem;
    font-size: 1rem;
  }

  .totalPrice{
    color: #E9232C;
  }


  .tabBarRight .pay{
    width:5rem;
    height: 2rem;
    background-color: #E9232C;
    border-radius: 1rem;
    margin-right: 0.5rem;

    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    color: #fff;
  }
</style>