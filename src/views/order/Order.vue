<template>
  <div id="order">
    <!-- 导航栏 -->
    <van-nav-bar
        title="填写订单"
        left-arrow
        :fixed=true
        :border=true
        @click-left="onClickLeft"
    />
    <!-- 收获地址 -->
    <van-contact-card
        :type="address_type"
        add-text="选择收货地址"
        :name="address_name"
        :tel="address_phone"
        @click="chooseAddress"
        style="margin-top: 3rem"
    />


    <van-cell-group style="margin-top: 0.6rem">
      <van-cell is-link title="送达时间" @click="showDatePopup" :value="arriveDate" />
      <router-link :to="{ path: '/confirmOrder/orderDetail' }">
        <van-cell :value="`共${goodsCount}件`" is-link :center="true">
          <!-- 使用 title 插槽来自定义标题 -->
          <template #title>
            <img
                v-for="(goods, index) in threeShopCart"
                :src="goods.small_image"
                style="width: 3rem;"
            />
          </template>
        </van-cell>
      </router-link>
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell title="支付方式" value="微信" />
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell title="备注">
        <input style="text-align: right" type="text" placeholder="选填，备注您的特殊需求" v-model="notice">
      </van-cell>
    </van-cell-group>

    <van-cell-group style="margin-top: 0.6rem">
      <van-cell title="商品金额" :value="`￥${totalPrice}`" />
      <van-cell title="配送费" :value="`￥${disPrice}`" />
    </van-cell-group>

    <van-submit-bar
        :price="totalPrice * 100 + disPrice * 100"
        style="touch-action: none;"
        button-text="提交订单"
        label="实付"
        @submit="onSubmit"
    />

    <!-- 弹出日期 -->
    <van-popup v-model="dateShow" round position="bottom">
      <van-datetime-picker
          v-model="currentDate"
          type="datetime"
          :min-date="minDate"
          :max-date="maxDate"
          @cancel="onDateCancel"
          @confirm="onDateConfirm"
      />
    </van-popup>

    <!-- 支付二维码 -->
    <van-popup v-model="isPay" round position="center">
      <qriously :value="qrcode" :size="200" />
    </van-popup>

    <transition name="router-slider" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'
import Moment from 'moment'
import {mapState} from 'vuex'
import {Toast} from "vant"
import {postOrder, orderPaySuccess, getWXCode, queryPayStatus, getAllSelectedGoods, delAllSelectedGoods} from '../../service/api/index'

export default {
  name: "Order",
  data() {
    return {
      // 1. 地址
      address_type: 'add',  // 地址卡片类型
      address_name: null,  // 收货人
      address_phone: null,  // 收货人电话
      address_id: null, // 收获人地址id

      // 2. 日期
      dateShow: false,
      minDate: new Date(2020, 0, 1),  // 最小时间
      maxDate: new Date(2025, 10, 1),
      currentDate: new Date(),

      // 3. 送达事件
      arriveDate: '请选择送达时间',
      // 4. 备注
      notice: null,

      isPay: false,  // 支付不显示 默认
      qrcode: null,  // 生成二维码的url地址
    }
  },
  computed: {
    ...mapState(['shopCart', 'userInfo']),
    // 商品总件数
    goodsCount() {
      let selectGoodsCount = 0;
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (goods.checked) {  // 选中时计算
          selectGoodsCount += 1;
        }
      });
      return selectGoodsCount;
    },
    // 商品总价
    totalPrice() {
      let totalPrice = 0;
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (goods.checked) {  // 选中时计算
          totalPrice += goods.price * goods.num;
        }
      });
      return totalPrice;
    },
    // 取购物车中前三件选中
    threeShopCart() {
      let shopCart = [];
      Object.values(this.shopCart).forEach((goods, index)=>{
        if (goods.checked) {  // 商品已选中
          shopCart.push(goods);
        }
      });
      return shopCart.slice(0, 3);
    },
    // 配送费
    disPrice() {
      // 商品总价 > 40 免配送费 < 40 ￥6
      if (this.totalPrice > 40) {
        return 0;
      } else {
        return 6;
      }
    }
  },
  methods: {
    // 点击左边
    onClickLeft() {  // 点击左边 返回
      this.$router.back();
    },
    // 选择地址
    chooseAddress() {  // 选择地址
      this.$router.push('/confirmOrder/myAddress');
    },
    // 提交订单
    async onSubmit() {
      // 数据验证
      if (!this.address_id) {
        Toast({
          message: '请选择收获地址',
          duration: 500
        });
        return;
      }
      if (this.arriveDate === '请选择送达时间') {
        Toast({
          message: '请选择送达时间',
          duration: 500
        });
        return;
      }
      if (!this.notice) {
        Toast({
          message: '请添加备注',
          duration: 500
        });
        return;
      }
      // 处理订单相关
      if (this.userInfo.token) {
        // 查询购物车订单
        let goodsResult = await getAllSelectedGoods(this.userInfo.token);
        // 创建订单
        if (goodsResult.success_code === 200) {
          let orderResult = await postOrder(
              this.userInfo.token,
              this.address_id,
              this.arrive_time,
              goodsResult.data,
              this.notice,
              this.totalPrice,
              this.disPrice
          );
          // 删除购物车中已经生成订单的商品
          if (orderResult.success_code === 200) {
            let delResult = await delAllSelectedGoods(this.userInfo.token);
            // 发起微信支付


            // let statusResult = await orderPaySuccess(this.userInfo.token, orderResult.data.order_id);
            //       console.log(statusResult);
            //       if (statusResult.success_code === 200) {
            //         Toast({
            //           message: '支付成功!',
            //           duration: 500
            //         });
            //         // 跳转界面
            //         this.$router.replace('/dashboard/mine');
            //         window.sessionStorage.setItem('tabBarActiveIndex', '3');
            //       }


            if (delResult.success_code === 200) {
              // todo orderResult.data.order_id, orderResult.data.total_price
              let urlResult = await getWXCode(orderResult.data.order_id, 1);
              if (urlResult.code_url) {  // 地址有值
                this.isPay = true;
                this.qrcode = urlResult.code_url;
                // 验证用户是否支付成功
                let payResult = await queryPayStatus(orderResult.data.order_id);
                console.log(payResult);
                if (payResult.success) {
                  Toast({
                    message: payResult.message,
                    duration: 1000
                  });
                  this.isPay = false;
                  // 通知自己服务器支付成功
                  let statusResult = await orderPaySuccess(this.userInfo.token, orderResult.data.order_id);
                  console.log(statusResult);
                  if (statusResult.success_code === 200) {
                    // 跳转界面
                    this.$router.replace('/dashboard/mine');
                    window.sessionStorage.setItem('tabBarActiveIndex', '3');
                  }
                } else {
                  Toast({
                    message: '微信支付服务器拒绝访问!',
                    duration: 500
                  });
                }
              }
            } else {
              Toast({
                message: '订单处理出现问题',
                duration: 500
              });
            }
          } else {
            Toast({
              message: '购物车同步出现问题',
              duration: 500
            });
          }
        } else {
          Toast({
            message: '获取订单商品失败',
            duration: 500
          });
        }
      }
    },
    // 展示日期组件
    showDatePopup() {
      this.dateShow = true;
    },
    // 取消日期组件
    onDateCancel() {
      this.dateShow = false;
    },
    // 确认日期组件
    onDateConfirm(value) {
      this.dateShow = false;
      this.arriveDate = Moment(value).format('YYYY-MM-DD hh:mm');
    }
  },
  mounted() {
    // 接收收获地址
    PubSub.subscribe('userAddress', (msg, address)=>{
      if (msg === 'userAddress') {  // 匹配成功
        // 修改卡片的类型
        this.address_type = 'edit';
        this.address_name = address.name;
        this.address_phone = address.tel;
        this.address_id = address.address_id;
      }
    });
  }
}
</script>

<style scoped>
  #order {
    width: 100%;
    height: 100%;
    background-color: #F5F5F5;
  }

  .router-slider-enter-active, .router-slider-leave-active {
    transition: all 0.5s;
  }

  .router-slider-enter, .router-slider-leave-active {
    transform: translate3d(2rem, 0, 0);
    opacity: 0;
  }
</style>