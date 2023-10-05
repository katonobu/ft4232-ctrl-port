import {HwAccess} from './HwReset'
import JsSerialWeb from '@katonobu/js-serial-web';

const grantAccessOption = {"filters":[{"usbVendorId": 0x0403, "usbProductId": 0x6011 }] }
export class HwAccessFt4232 extends HwAccess {
    private readonly jsw:JsSerialWeb
    private readonly setInitSuccess:(stt:boolean)=>void
    private currentUsingPortId:number
    constructor(setInitSuccess:(stt:boolean)=>void){
        super()
        this.setInitSuccess = setInitSuccess
        this.jsw = new JsSerialWeb()
        this.jsw.init()
        this.currentUsingPortId = -1
    }
    async init(
        // @ts-ignore
        option:any
    ):Promise<boolean> {
//        console.log("Ft4232Init()")
        // すでにOpenされている?
        if (0 <= this.currentUsingPortId) {
            return true
        } else {
            let ports = this.jsw.getPorts()
            console.log(ports)
            // 1つもポートアクセス許可されたポートがつながっていない?
            if (ports.curr.filter((p:any)=>p.available).length === 0) {
                // ポートアクセス許可を取得
//                console.log("ports.curr.length === 0, invoke grantAccess()")
                // @ts-ignore
                const gaResult = await this.jsw.promptGrantAccess(grantAccessOption)
//                console.log(gaResult)
            }
            // 再度有効ポート数を確認
            ports = this.jsw.getPorts()
            const availablePorts = ports.curr.filter((p:any)=>p.available)
            // アクセス許可されていてつながっているポートが1つ?
            if (availablePorts.length === 1) {
                const portId = availablePorts[0].id
//                console.log(`ports.curr.length === 1, try to openPort(${portId})`)
                const unsubscribe = this.jsw.subscribeOpenStt(portId, ()=>{
                    const portOpenStt = this.jsw.getOpenStt(portId)
                    // portがCloseした?
                    if(portOpenStt === false){
                        // ToDo:ポーリングタイマー停止
                        this.setInitSuccess(false)
                        this.currentUsingPortId = -1                    
                        unsubscribe()
                    // portがOpenした?
                    } else {
                        // ToDo:インターバルタイマー起動してポート状態ポーリング開始
                    }
                })
                // ポートオープン処理
                try {
                    const result = await this.jsw.openPort(portId, {
                        serialOpenOptions:{
                            baudRate:115200,
                            flowControl:'none' // 制御ポートをいじるのでflowControlを'none'で設定する必要あり
                        }
                    })
//                    console.log(`Open target port:${portId} ${result}`)
                    if (result === "OK") {
                        this.currentUsingPortId = portId
                        return true
                    } else {
                        return false
                    }
                } catch(e) {
                    // 例外はthrowされないはず
                    console.error(e)
                    return false
                }
            } else {
                console.warn(`availablePorts.length === ${availablePorts.length} !== 1`)
                return false
            }
        }
    }
    async setResetPort(stt:boolean):Promise<boolean> {
//        console.log(`Ft4232SetResetPort(${stt})`)
        if (0 <= this.currentUsingPortId) {
            const result = await this.jsw.setPort(this.currentUsingPortId, {requestToSend:stt})
//            console.log(result)
            return result
        } else {
            throw( new Error("Port is not opened"))
        }
    }
    async setSleepPort(stt:boolean):Promise<boolean>{
//        console.log(`Ft4232SetSleepPort(${stt})`)
        if (0 <= this.currentUsingPortId) {
            const result = await this.jsw.setPort(this.currentUsingPortId, {dataTerminalReady:stt})
//            console.log(result)
            return result
        } else {
            throw( new Error("Port is not opened"))
        }
    }
    async finalize():Promise<void> {
    }
}

