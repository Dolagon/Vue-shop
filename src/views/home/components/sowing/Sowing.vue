<template>
    <swiper id="swiper" :options="swiperOption" ref="mySwiper">
      <!-- slides -->
      <swiper-slide v-for="(sowing, index) in sowing_list" :key="sowing.public_id">
        <img :src="sowing.icon_url"  :alt="sowing.public_name">
      </swiper-slide>
      <!-- Optional controls -->
      <div class="swiper-pagination"  slot="pagination"></div>
    </swiper>
</template>

<script>
import 'swiper/dist/css/swiper.min.css'
import { swiper, swiperSlide } from 'vue-awesome-swiper'


export default {
  name: "Sowing",
  props: {
    sowing_list: Array  // 接收sowing_list
  },
  data() {
    return {
      swiperOption: {
        notNextTick: true,
        pagination: {  // 配置分页
          el: '.swiper-pagination',
          clickable: true
        },
        loop: true,  // 循环
        autoplay: {  // 自动循环
          delay: 2000
        },
        speed: 500,  // 速度
        on: {  // 滑动后监听
          slideChangeTransitionEnd() {
            // console.log(this.activeIndex);
          }
        }
      }
    }
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.swiper;
    }
  },
  mounted() {
    // 一秒内直接滑动到第五页
    // this.swiper.slideTo(5, 1000, false);
  },
  components: {
    swiper,
    swiperSlide
  }
}
</script>

<style scoped>
 #swiper {
   width: 100%;
   height: 14rem;
 }

 #swiper img {
   width: 100%;;
   height: 100%;
 }

 /*
  穿透修改样式
 */
 #swiper >>> .swiper-pagination-bullet-active {
   background-color: #75a342;
 }
</style>