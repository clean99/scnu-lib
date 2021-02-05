import React, { useState,useEffect } from 'react';
import { Button, message, Modal } from 'antd';
import Labels from '../../../components/Labels';
import { actSignUpApi, userVolSignUpApi } from '@/Services/activity';
import './ActivityDetail.css';
import { getUserID, isLogined } from '@/Utils/auth';
import { useSelector, useDispatch } from 'react-redux';
import { volunteerApplicationState } from '@/Utils/config';
import { addRegisteredAct } from '@/reducers/actRegisteredReducer';
import HandleDate from '@/components/HandleDate';
//活动页
function ActivityDetail(props: any) {
  //活动详情页，做成对话框形式，把所有活动信息列出来，加上报名志愿者和报名活动的按钮
  const [isSigned, setIsSigned] = useState(false);
  
  const [loading, setLoading] = useState([false, false]); //两个按钮，因为是异步操作，所以设置其loading状态，用usestate管理状态
  const dispatch = useDispatch(); // 更新已报名活动的状态
  const acts = useSelector(store => store.act); // 下面报名成功后只有id，通过id查找活动详情放到已报名活动中
  const regActs = useSelector(store => store.regAct);
  useEffect(() => {
      //console.log(regActs,props.modalDetail?.id)
      if(regActs.find(a=>a=== props.modalDetail?.id)){
      setIsSigned(true);
    }
   
  }, [])
  const handleSignUpAct = (activityID: number, id: number) => {
    //活动报名申请
    setLoading([true, loading[1]]); //调用按钮，设置loading[0]为正表示正在加载
    actSignUpApi(activityID, id)
      .then(res => {
        //message.success('报名成功！');
        setTimeout(() => {
          dispatch(addRegisteredAct(getUserID(),props.modalDetail?.id));
        }, 0);
        setIsSigned(true);
        setLoading([false, loading[1]]);
        message.success('报名成功！');
      })
      .catch(err => {
        setLoading([false, loading[1]]);
        console.log(err);
      });
  };
  const handleVolSignUp = async (acitivityID: number, userID: number) => {
    setLoading([loading[0], true]);
    //志愿者报名申请，目前需要一个接口可以查询志愿者的状态
    try {
      const res = await userVolSignUpApi(
        acitivityID,
        userID,
        volunteerApplicationState.applied,
      );
      setLoading([loading[0], false]);
      message.success('申请成功，请等待管理员批准');
    } catch (err) {
      setLoading([loading[0], false]);
      console.log(err);
    }
  };
  return (
    <Modal
      className="actDetail-modal"
      title={props.modalDetail?.title}
      visible={props.isDetailsVisible}
      onOk={props.handleOk}
      onCancel={props.handleCancel}
      footer={null}
      width={550}
    >
      <div className={`img${/*props.modalDetail?.id*/6}`}></div>

      <div className="actDetail-details">
        <p>
          报名截止于: {HandleDate(props.modalDetail?.signUpDeadline)} 活动日期：
          {HandleDate(props.modalDetail?.startTime)}~
          {HandleDate(props.modalDetail?.endTime)}{' '}<br/>
          活动地点：{props.modalDetail?.location}{' '}
          {/*props.modalDetail?.volState ? '招募志愿者' : '暂不招募志愿者'*/}{' '}
          当前报名人数：{props.modalDetail?.currentParticipant}/
          {props.modalDetail?.maxParticipant} 人 
        </p>
        <p>
          {props.modalDetail?.detail?.description}
        </p>
      </div>
      <div className="actDetail-content">{props.modalDetail?.content}</div>
      <div className="actDetail-textpart">
        <Labels labels={props.modalDetail?.labels}></Labels>
        <div className="actDetail-button">
        <Button
            disabled={isSigned}
            loading={loading[0]}
            onClick={() => {
              isLogined()
                ? handleSignUpAct(props.modalDetail?.id, getUserID())
                : message.error('请先登录');
            }}
          >
            {isSigned?'已报名':'报名活动'}
          </Button>
          {/*props.modalDetail?.volState ? (
            <Button
              id="volSignUpButton"
              loading={loading[1]}
              onClick={() => {
                isLogined()
                  ? handleVolSignUp(props.modalDetail?.id, getUserID())
                  : message.error('请先登录');
              }}
            >
              报名志愿者
            </Button>
            ) : null*/}
            <Button
              id="volSignUpButton"
              loading={loading[1]}
              onClick={() => {
                isLogined()
                  ? handleVolSignUp(props.modalDetail?.id, getUserID())
                  : message.error('请先登录');
              }}
            >
              报名志愿者
            </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ActivityDetail;
