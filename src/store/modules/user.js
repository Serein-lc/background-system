import { loginApi, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'


const getDefaultState = () => {
    return {
        user: null, //存储登录后的信息
    }
}

const state = getDefaultState()

const mutations = {
    RESET_STATE: (state) => {
        Object.assign(state, getDefaultState())
    },
    // SET_TOKEN: (state, token) => {
    //     state.token = token
    // },
    // SET_NAME: (state, name) => {
    //     state.name = name
    // },
    // SET_AVATAR: (state, avatar) => {
    //     state.avatar = avatar
    // },
    SET_USER: (state, payload) => {
        state.user = payload;
    }
}

const actions = {
    // 登录
    login({ commit }, userInfo) {
        // userInfo 是用户提交的数据，接下来将用户的数据发送到服务器

        return new Promise((resolve, reject) => {
            loginApi(userInfo).then((res) => {
                // 看接口文档得知成功的话 res.data是有值的
                const { data } = res;
                if (data) {
                    // 说明data里面有数据,接下来要将我们的data信息保存到 vuex里面
                    commit('SET_USER', data)
                    resolve();
                } else {
                    // data为空，如果data为空，怎么处理？我们可以将整个放到一个新的promise，就可以在这里reject
                    reject(res);
                }
            }).catch(error => {
                reject(error);
            })
        })


        // const { username, password } = userInfo
        // return new Promise((resolve, reject) => {
        //   login({ username: username.trim(), password: password }).then(response => {
        //     const { data } = response
        //     commit('SET_TOKEN', data.token)
        //     setToken(data.token)
        //     resolve()
        //   }).catch(error => {
        //     reject(error)
        //   })
        // })
    },

    // 恢复登录状态
    getInfo({ commit, state }) {
        return new Promise((resolve, reject) => {
            // 发送请求
            getInfo().then(res => {
                // 接下来会分两种情况，1.没登陆  2.token过期。 
                // 验证失败的情况 ：{"code":401,"msg":"未登录，或登录已过期","data":null}
                /**
                 * 验证成功的情况
                 * {
                    "code": 0,
                    "msg": "",
                    "data": {
                        "loginId": "yjisme",
                        "name": "管理员",
                        "id": "608530d2dfce8783ab52a45d"
                    }
                }
                 */
                if (typeof res === 'string') {
                    // 未登录或者token已经过期
                    res = JSON.parse(res);
                    if (res.code === 401) {
                        reject(res.msg);
                    }
                } else {
                    // 说明这个token是ok的，接下来将用户信息放入仓库
                    commit('SET_USER', res.data)
                    resolve()

                }
            })




            // getInfo(state.token).then(response => {
            //     const { data } = response

            //     if (!data) {
            //         return reject('Verification failed, please Login again.')
            //     }

            //     const { name, avatar } = data

            //     commit('SET_NAME', name)
            //     commit('SET_AVATAR', avatar)
            //     resolve(data)
            // }).catch(error => {
            //     reject(error)
            // })
        })
    },

    // 登出（注销）
    logout({ commit, state }) {
        return new Promise((resolve, reject) => {
            removeToken() // 删除token
            resetRouter() //重置路由 不用管
            commit('RESET_STATE')
            resolve()
                // logout(state.token).then(() => {
                //     removeToken() // must remove  token  first
                //     resetRouter()
                //     commit('RESET_STATE')
                //     resolve()
                // }).catch(error => {
                //     reject(error)
                // })
        })
    },

    // 删除token
    resetToken({ commit }) {
        return new Promise(resolve => {
            removeToken() // must remove  token  first
            commit('RESET_STATE')
            resolve()
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}