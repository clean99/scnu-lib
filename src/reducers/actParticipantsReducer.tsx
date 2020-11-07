import { delvolApi, volsignupApi } from '@/Services/activity';
import {listactParticipantsApi,listactvolappliesApi} from '@/Services/admin'
import {getnotifyApi,getsettingApi} from '@/Services/auth'
import { VolunteerApplicationState } from '@/Utils/config';
import {message} from 'antd'
const initState = []
const actParticipantsReducer = (state:any = initState,action:any) => {
    switch(action.type){
        case 'INIT_PARTICIPANTS':return action.data;
        case 'DELETE_PARTICIPANT':return state.filter((note:object)=> note.id !== action.data);
        case 'ADD_PARTICIPANT':return [...state,action.data]
        case 'SIGNIN_VOLUNTEER':
        return state.map(p =>
            p.id === action.data?{...p,volunteer:!p.volunteer}:p)// 申请为志愿者，先put到后端，然后获取相关id，修改前端的state，使用数组map遍历
        case 'DELETE_VOLUNTEER':
        return state.filter(p => p.id !== action.data)
        default:return state;
    }
}
export const signinvol = (activityID:number,userID:number)=>{
    return async dispatch => {
        try{
            const res = await volsignupApi(activityID,userID)
            dispatch({
                type:'SIGNIN_VOLUNTEER',
                data:res.data.id
            })
            message.success('报名成功！')
        }catch(err){
            console.log(err)
            message.error('报名失败！')
        }

    }
}
export const delvol = (activityID:number,userID:number)=>{
    return async dispatch => {
        try{
            const res = await delvolApi(activityID,userID)
            dispatch({
                type:'DELETE_VOLUNTEER',
                data:res.data.id
            })
            message.success('删除成功！')
        }catch(err){
            console.log(err)
            message.error('删除失败！')
        }
    }
}
export const initParticipants = (activityID:number,page:number,size:number) => {
    return async dispatch => {
        try{
        const volres = await listactParticipantsApi(activityID,page,size)// 获得所有志愿者id
        const volappliesres = await listactvolappliesApi(activityID)// 获得正在申请志愿者的id和状态
        const volapplies = volappliesres.data
        volres.data.forEach(async (v:object)=>{// 用forEach把封装好的志愿者信息加到vol里，这里用map直接返回会返回几个promise，很难搞定
            const notifyres = await getnotifyApi(String(v.id))// 获得通知方式
            const settingres = await getsettingApi(String(v.id))// 获得用户名
            const apply = volapplies.find((note:object)=>note.userID === v.id)// 找到申请信息
            const note =  {
                id:settingres.data.id,
                name:settingres.data.detail.name,
                role:settingres.data.role,
                connection:notifyres.data.wechat.enabled?notifyres.data.wechat.wxid:notifyres.data.email.address,
                state:apply?apply.state:VolunteerApplicationState.accepted,
                reason:apply?apply.reason:'null',
            }// 封装起来
            console.log(apply)
            dispatch({
                type:'ADD_PARTICIPANT',
                data:note
            })// 发送到store
        })

        }catch(err){
            console.log(err)
        }
    }
}
export default actParticipantsReducer;