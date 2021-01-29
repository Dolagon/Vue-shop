<template>
  <!--!userInfo.token-->
  <div v-if="userInfo.token" id="mine">
    <van-nav-bar
        title="个人中心"
        :fixed=true
        :border=false
        style="background-color: #3bba63;"
    />

    <van-cell-group style="margin-top: 2.2rem">
      <!-- #3bba63 -->
      <van-cell
          style="background-color: #3bba63;color: #FFFFFF"
          :center=true
          is-link
      >
        <template #title>
          <div class="personMsg" @click="$router.push('/dashboard/mine/userCenter')">
<!--            <img :src="userInfo.icon_url" alt="">-->
            <img src="./images/per.jpg" alt="">
            <div class="personInfo">
              <span>{{ userInfo.real_name }}</span>
              <span>微信号: {{ userInfo.phone }}</span>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group>
      <van-cell
          icon="label"
          is-link
          title="我的订单"
          value="查看所有的订单"
          @click="$router.push({ path: '/dashboard/mine/mineOrder' })"
      />
      <router-link tag="div" :to="{ path: '/dashboard/mine/mineOrder' }">
        <van-grid :column-num="4">
          <van-grid-item
              v-for="(order, index) in orderData"
              :key="index"
              :icon="order.icon"
              :text="order.title"
          />
        </van-grid>
      </router-link>
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell icon="gold-coin" is-link title="我的优惠券" value="1张" />
      <van-cell icon="coupon" is-link title="我的收获地址"/>
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell icon="phone" is-link title="联系客服" value="客服时间 07:00-22:00" />
      <van-cell icon="service" is-link title="意见反馈" value="查看所有的订单" />
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell icon="cluster" is-link title="客户端" value="下载APP" />
    </van-cell-group>

    <!-- 路由出口 -->
    <transition name="router-slider" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
  <SelectLogin v-else></SelectLogin>
</template>

<script>
import SelectLogin from "../login/SelectLogin"
import {mapState} from "vuex"

export default {
  name: "Mine",
  components: {
    SelectLogin,
  },
  computed: {
    ...mapState(['userInfo']),
  },
  data() {
    return {
      orderData: [
        {icon: 'todo-list-o', title: '待支付'},
        {icon: 'gift-o', title: '待收货'},
        {icon: 'more-o', title: '待评价'},
        {icon: 'cash-back-record\n', title: '收获/退款'}
      ]
    }
  }
}
</script>

<style scoped>
  #mine {
    width: 100%;
    height: 100%;
    background-color: #F5F5F5;
  }

  .van-nav-bar__title {
    color: #fff;
    font-size: 1rem;
  }

  ::v-deep .van-nav-bar__title {
    color: #fff;
  }

  .van-cell__left-icon {
    color: orange;
    font-size: 1.2rem;
  }

  .personMsg {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .personMsg>img {
    width: 4rem;
    height: 4rem;
    border-radius: 2rem;
    border: 0.1rem solid #fff;
  }

  .personInfo {
    display: flex;
    flex-direction: column;
    margin-left: 0.8rem;
  }

  .router-slider-enter-active, .router-slider-leave-active {
    transition: all 0.5s;
  }

  .router-slider-enter, .router-slider-leave-active {
    transform: translate3d(2rem, 0, 0);
    opacity: 0;
  }
</style>