<template>
  <div id="myAddress">
    <!-- 导航栏 -->
    <van-nav-bar
        title="我的地址"
        left-arrow
        :fixed=true
        :border=true
        @click-left="onClickLeft"
    />
    <!-- 我的地址 -->
    <van-address-list
        v-model="chosenAddressId"
        :list="list"
        default-tag-text="默认"
        @add="onAdd"
        @edit="onEdit"
        @select="onBackAddress"
        style="margin-top: 3rem;"
    />
    <transition name="router-slider" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import {Toast} from 'vant';
import {getUserAddress} from '../../../service/api/index'
import {mapState} from 'vuex'
import PubSub from 'pubsub-js'


export default {
  name: "MyAddress",
  data() {
    return {
      chosenAddressId: '1',
      list: []
    };
  },
  computed: {
    ...mapState(['userInfo'])
  },
  mounted() {
    this.initUserAddress();
    // 订阅添加地址成功
    PubSub.subscribe('backToMyAddress', (msg)=>{
      if (msg === 'backToMyAddress') {
        this.initUserAddress();  // 重新拉数据
      }
    });
  },
  methods: {
    onClickLeft() {  // 点击左边 返回
      this.$router.go(-1);
    },
    onAdd() {
      this.$router.push({
        path: '/confirmOrder/myAddress/addAddress'
      });
    },
    onEdit(item, index) {
      this.$router.push({
        path: '/confirmOrder/myAddress/editAddress?address_id=' + item.address_id
      });
    },
    // 获取当前用户的地址
    async initUserAddress() {
      if (this.userInfo.token) {  // 处于登陆状态
        let result = await getUserAddress(this.userInfo.token);
        if (result.success_code === 200) {  // 获取地址成功
          let addressArr = result.data;
          this.list = [];
          addressArr.forEach((address, index)=>{
            let addressObj = {
              id: String(index + 1),
              name: address.address_name,
              tel: address.address_phone,
              address: address.address_area + address.address_area_detail,
              address_id: address._id,
              user_id: address.user_id
            }
            // 追加到数据
            this.list.push(addressObj);
          });
        } else {
          Toast({
            message: '获取地址失败',
            duration: 500
          });
        }
      } else {
        Toast({
          message: '登陆已经过期，请退出登陆',
          duration: 500
        });
      }
    },
    // 返回选中的地址
    onBackAddress(item, index) {
      if (item) {
        // 发布地址数据
        PubSub.publish('userAddress', item);
        // 返回上一级界面
        this.$router.back();
      }
    }
  },
  beforeDestroy() {
    PubSub.unsubscribe('backToMyAddress');
  }
}
</script>

<style scoped>
  #myAddress {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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