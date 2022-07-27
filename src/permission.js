import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist 白名单：不需要权限的路径

// 路由前置守卫
router.beforeEach(async(to, from, next) => {
    // start progress bar
    NProgress.start(); //进度条开始

    // set page title
    document.title = getPageTitle(to.meta.title)

    // determine whether the user has logged in
    // const hasToken = getToken()

    const hasGetUserInfo = store.getters.user; //获取本地用户信息，可以判断是否已经登录


    if (to.meta.auth) {
        // 目标页面需要鉴权
        if (hasGetUserInfo) {
            // 进入此if有用户信息，直接放行
            next();
        } else {
            // 没有用户信息，判断是否有token
            const hasToken = localStorage.getItem('adminToken'); //获取本地token

            if (hasToken) {

                // 进入此if说明有token 验证一下token的有效性
                try {
                    // 进到这里说明token是有效的，恢复登录状态之后直接放行
                    await store.dispatch('user/getInfo'); //恢复登录状态
                    next();
                } catch (error) {
                    // 进到catch之后说明token是一个无效的token，所以要重新登录
                    await store.dispatch('user/resetToken');
                    Message.error('登录过期，请重新登录'); //element ui 的组件
                    next(`/login?redirect=${to.path}`); //导航到login页面，登陆成功后再进目标页
                    NProgress.done(); //进度条走完
                }
            } else {
                // 说明没有token 所以要重新登录
                next(`/login?redirect=${to.path}`)
                NProgress.done(); //进度条走完

            }
        }
    } else {
        // 说明该页面不需要鉴权
        if (to.path === '/login' && hasGetUserInfo) {
            // 是去的login，并且有用户信息，说明已经登录，直接导航到首页
            next({ path: '/' })
        } else {
            // 不是去的login，直接放行
            next()
        }
        NProgress.done()
    }



    // vue-element-admin原本鉴权流程
    // if (hasToken) {
    //     // 说明有token
    //     if (to.path === '/login') {
    //         // 如果登录进去了，直接进入首页
    //         next({ path: '/' })
    //         NProgress.done()
    //     } else {
    //         // 进的不是login
    //         // 看一下是否有用户信息
    //         const hasGetUserInfo = store.getters.name
    //         if (hasGetUserInfo) {
    //             // 有用户信息
    //             next()
    //         } else {
    //             // 进入了else说明没有用户信息，但是又有token，接下来使用localStorage 里面的token去服务器拿用户信息，恢复登录状态
    //             try {
    //                 // 获取成功，恢复了登录状态
    //                 await store.dispatch('user/getInfo')

    //                 next()
    //             } catch (error) {
    //                 // token有问题，重置token，然后导航到登录页面
    //                 await store.dispatch('user/resetToken')
    //                 Message.error(error || 'Has Error')
    //                 next(`/login?redirect=${to.path}`)
    //                 NProgress.done()
    //             }
    //         }
    //     }
    // } else {
    //     /* 没有 token*/

    //     if (whiteList.indexOf(to.path) !== -1) {
    //         // 判断是否进白名单页面
    //         next()
    //     } else {
    //         // 进入的页面不在白名单里面（需要权限）
    //         next(`/login?redirect=${to.path}`) //导航到登录
    //         NProgress.done()
    //     }
    // }
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})