<template>
  <div id="orderDetail">
    <!-- 导航栏 -->
    <van-nav-bar
        title="我的订单"
        left-arrow
        :fixed=true
        :border=true
        @click-left="$router.back()"
    />

    <van-tabs
        v-model="activeName"
        style="margin-top: 2.6rem"
        title-active-color="#75a342"
        color="#75a342"
        @click="dealWithTabClick"
    >
      <van-tab title="全部" name="a">
        <MineOrderItem v-for="(order, index) in allOrderArr" :order="order" :key="order._id"></MineOrderItem>
      </van-tab>
      <van-tab title="待支付" name="b">
        <MineOrderItem v-for="(order, index) in allWillOrderArr" :order="order" :key="order._id"></MineOrderItem>
      </van-tab>
      <van-tab title="待收货" name="c">
        <MineOrderItem v-for="(order, index) in allPayOrderArr" :order="order" :key="order._id"></MineOrderItem>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import MineOrderItem from "./components/MineOrderItem"
import {getOrder} from '../../../service/api/index'
import {mapState} from 'vuex'
import {Toast} from "vant"

export default {
  name: "MineOrder",
  components: {
    MineOrderItem
  },
  data() {
    return {
      activeName: 'a',
      allOrderArr: null,  // 所有的订单
      allWillOrderArr: null,  // 所有待支付订单
      allPayOrderArr: null  // 所有支付的订单
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  mounted() {
    // 获取订单数据
    this.initOrder();
  },
  methods: {
    async initOrder() {
      let result = await getOrder(this.userInfo.token);
      if (result.success_code === 200) {
        this.allOrderArr = result.data;
      } else {
        Toast({
          message: '订单获取失败',
          duration: 600
        });
      }
    },
    // 获取tab里的order (status) 状态
    async getTabOrder(status) {
      let result = await getOrder(this.userInfo.token, status);
      if (result.success_code === 200) {
        return result.data;
      } else {
        Toast({
          message: '订单获取失败',
          duration: 600
        });
      }
    },
    // 实现点击方法
    async dealWithTabClick(name, title) {
      if (name === 'a') {  // 点击了第一个选项
        this.allOrderArr = await this.getTabOrder();
      } else if (name === 'b') {
        this.allWillOrderArr = await this.getTabOrder('will');
      } else if (name === 'c') {
        this.allPayOrderArr = await this.getTabOrder('pay');
      }
    }
  }
}
</script>

<style scoped>
 #orderDetail {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   height: 120%;
   background-color: #F5F5F5;
   z-index: 200;
 }

 .router-slider-enter-active, .router-slider-leave-active {
   transition: all 0.5s;
 }

 .router-slider-enter, .router-slider-leave-active {
   transform: translate3d(2rem, 0, 0);
   opacity: 0;
 }
</style>