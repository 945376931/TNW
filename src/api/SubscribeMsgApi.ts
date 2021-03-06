/**
 * @author Javen 
 * @copyright 2019-03-29 javendev@126.com 
 * @description一次性订阅消息
 */
import * as util from 'util';
import urlencode from 'urlencode';
import { ApiConfigKit } from '../ApiConfigKit';
import { AccessTokenApi } from '../AccessTokenApi';
import { AccessToken } from '../AccessToken';
import { HttpKit } from '../kit/HttpKit';
import { SubscribeMsg } from '../entity/subscribe/SubscribeMsg';

export class SubscribeMsgApi {
    private static authorizeUrl: string = "https://mp.weixin.qq.com/mp/subscribemsg?action=get_confirm&appid=%s&scene=%d&template_id=%s&redirect_url=%s"
    private static subscribeUrl: string = "https://api.weixin.qq.com/cgi-bin/message/template/subscribe?access_token=%s";
    /**
     * 获取授权URL
     * @param scene  0-10000 场景值
     * @param templateId 订阅消息模板ID
     * @param redirectUrl 
     * @param reserved 可以填写a-zA-Z0-9的参数值
     */
    public static getAuthorizeURL(scene: number, templateId: string, redirectUrl: string, reserved?: string): string {
        let url = util.format(this.authorizeUrl, ApiConfigKit.getApiConfig.getAppId, scene, templateId, urlencode(redirectUrl));
        if (reserved) {
            url = url + "&reserved=" + urlencode(reserved);
        }
        return url + "#wechat_redirect";
    }
    /**
     * 推送订阅模板消息给到授权微信用户
     * @param subscribeMsg 
     */
    public static async send(subscribeMsg: SubscribeMsg) {
        return this.sendMsg(JSON.stringify(subscribeMsg));
    }

    public static async sendMsg(json: string) {
        let accessToken = await AccessTokenApi.getAccessToken();
        let url = util.format(this.subscribeUrl, (<AccessToken>accessToken).getAccessToken);
        return HttpKit.httpPost(url, json);
    }

}