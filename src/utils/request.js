import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
    // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        const token = localStorage.getItem('adminToken')
        if (token) {
            // 请求拦截，每次请求都会把token带上，berrer后面的空格千万不要删，服务器就是以空格分割
            config.headers['Authorization'] = "Bearer " + token;
        }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        if (response.headers.authentication) {
            // 服务器会在响应头中添加 authentication字段，这个字段就是服务器给我们的token，
            // 如果有这个字段，我们保存在我们的localstorage中，当访问需要授权的接口时，需要将token放到请求头中
            // 这一步很重要，一定要将token存储到本地
            localStorage.adminToken = response.headers.authentication;
        }
        return response.data //直接响应放行

        // if the custom code is not 20000, it is judged as an error.
        // if (res.code !== 20000) {
        //   Message({
        //     message: res.message || 'Error',
        //     type: 'error',
        //     duration: 5 * 1000
        //   })

        //   // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
        //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        //     // to re-login
        //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        //       confirmButtonText: 'Re-Login',
        //       cancelButtonText: 'Cancel',
        //       type: 'warning'
        //     }).then(() => {
        //       store.dispatch('user/resetToken').then(() => {
        //         location.reload()
        //       })
        //     })
        //   }
        //   return Promise.reject(new Error(res.message || 'Error'))
        // } else {
        //   return res
        // }
    },
    error => {
        console.log('err' + error) // for debug
        Message({
            message: error.message,
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

export default service