import { useState } from 'react'
import SlideSwitch from './components/SlideSwitch'

enum resetSequenceEnum {
    Normal,
    NormalLong,
    FwUpdate,
    FwUpdateLong,
}

const setHwAndEnablePortStt = async (
    stt: boolean,
    hwAccess: HwAccess | null,
    setEnablePortStt: (stt: boolean) => void
): Promise<boolean> => {
    let ret = false
    if (hwAccess) {
        try {
            if (await hwAccess.setResetPort(stt)) {
                setEnablePortStt(stt)
                ret = true
            } else {
                console.error("Fail to hwAccess.setResetPort(stt)")
            }
        } catch (e) {
            console.error(e)
        }
    } else {
        console.error("hwAccess is falsy")
    }
    return ret
}

const setHwAndSleepPortStt = async (
    stt: boolean,
    hwAccess: HwAccess | null,
    setSleepPortStt: (stt: boolean) => void
): Promise<boolean> => {
    let ret = false
    if (hwAccess) {
        try {
            if (await hwAccess.setSleepPort(stt)) {
                setSleepPortStt(stt)
            } else {
                console.error("Fail to hwAccess.setSleepPort(stt)")
            }
        } catch (e) {
            console.error(e)
        }
    } else {
        console.error("hwAccess is falsy")
    }
    return ret
}


export class HwAccess {
    constructor() {
    }
    async init(
        // @ts-ignore
        option: any
    ): Promise<boolean> {
        console.log("init()")
        await new Promise<void>((resolve) => setTimeout(resolve, 1500))
        return true
    }
    async setResetPort(stt: boolean): Promise<boolean> {
        console.log(`setResetPort(${stt})`)
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 10))
        return true
    }
    async setSleepPort(stt: boolean): Promise<boolean> {
        console.log(`setSleepPort(${stt})`)
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 10))
        return true
    }
    async finalize(): Promise<void> {
        console.log(`finalize()`)
        await new Promise<void>((resolve) => setTimeout(resolve, 10))
    }
}

const execResetSequence = async (
    hwAccess: HwAccess | null,
    sequenceType: resetSequenceEnum,
    setEnablePortStt: (stt: boolean) => void,
    setSleepPortStt: (stt: boolean) => void,
    setDisable: (stt: boolean) => void,
) => {
    if (hwAccess) {
        try {
            setDisable(true)
            const reestDuration = (sequenceType === resetSequenceEnum.NormalLong || sequenceType === resetSequenceEnum.FwUpdateLong) ? 1000 : 500
            setHwAndEnablePortStt(false, hwAccess, setEnablePortStt)
            if (
                sequenceType === resetSequenceEnum.FwUpdateLong ||
                sequenceType === resetSequenceEnum.FwUpdate
            ) {
                setHwAndSleepPortStt(true, hwAccess, setSleepPortStt)
            } else {
                setHwAndSleepPortStt(false, hwAccess, setSleepPortStt)
            }
            await new Promise<void>((resolve) => setTimeout(resolve, 300))
            setHwAndEnablePortStt(true, hwAccess, setEnablePortStt)
            await new Promise<void>((resolve) => setTimeout(resolve, reestDuration))
            setHwAndEnablePortStt(false, hwAccess, setEnablePortStt)
        } catch (e) {
            console.error(e)
        } finally {
            setDisable(false)
        }
    } else {
        console.error("hwAccess is null")
    }
}

export const HwAccessInit = (props: {
    hwAccess: HwAccess | null,
    disable: boolean,
    setDisable: (stt: boolean) => void,
    initSuccess: boolean,
    setInitSuccess: (stt: boolean) => void,
    setEnablePortStt: (stt: boolean) => void,
    setSleepPortStt: (stt: boolean) => void,
    option?: any
}) => {
    const {
        hwAccess,
        disable,
        setDisable,
        initSuccess,
        setInitSuccess,
        setEnablePortStt,
        setSleepPortStt,
        option = {}
    } = props
    const [initDisabled, setInitDisabled] = useState<boolean>(false)
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <button
                disabled={!(
                    (!initSuccess && !initDisabled) ||
                    (initSuccess && !disable)
                )}
                onClick={async () => {
                    if (hwAccess) {
                        setInitDisabled(true)
                        setDisable(true)
                        const result = await hwAccess.init(option)
                        setInitSuccess(result)
                        setDisable(!result)
                        if (result) {
                            setHwAndEnablePortStt(false, hwAccess, setEnablePortStt)
                            setHwAndSleepPortStt(false, hwAccess, setSleepPortStt)
                        }
                        setInitDisabled(false)
                    }
                }}
                style={{
                    width: '8em',
                    height: '3em',
                    margin: '8px',
                }}
            >
                Access Init
            </button>
        </div>
    )
}
export const HwReset = (props: {
    hwAccess: HwAccess | null,
    disable: boolean,
    setDisable: (stt: boolean) => void,
    enablePortStt: boolean,
    setEnablePortStt: (stt: boolean) => void,
    sleepPortStt: boolean,
    setSleepPortStt: (stt: boolean) => void,
}) => {
    const {
        hwAccess,
        disable,
        setDisable,
        enablePortStt,
        setEnablePortStt,
        sleepPortStt,
        setSleepPortStt,
    } = props
    return (
        <>
            <div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <button
                        onClick={() => execResetSequence(hwAccess, resetSequenceEnum.NormalLong, setEnablePortStt, setSleepPortStt, setDisable)}
                        disabled={disable}
                        style={{
                            width: '8em',
                            height: '3em',
                            margin: '8px',
                        }}
                    >
                        Normal RESET
                    </button>
                    <button
                        onClick={() => execResetSequence(hwAccess, resetSequenceEnum.FwUpdateLong, setEnablePortStt, setSleepPortStt, setDisable)}
                        disabled={disable}
                        style={{
                            width: '8em',
                            height: '3em',
                            margin: '8px',
                        }}
                    >
                        FW Update RESET
                    </button>
                </div>
                <div>
                    <div
                        style={{
                            margin: '8px'
                        }}
                    >
                        <SlideSwitch
                            disabled={disable}
                            id={'reset'}
                            checked={enablePortStt}
                            setChecked={async (stt: boolean) => {
                                setHwAndEnablePortStt(stt, hwAccess, setEnablePortStt)
                            }}
                            checkedStr={"Resetting"}
                            unCheckedStr={'Reset Released'}
                            transformDurationMs={500}
                            checkedColor='blue'
                            unCheckedBackgroundColor='rgb(208,208,208)'
                        />
                    </div>
                    <div
                        style={{
                            margin: '8px'
                        }}
                    >
                        <SlideSwitch
                            disabled={disable}
                            id={'sleep'}
                            checked={sleepPortStt}
                            setChecked={async (stt: boolean) => {
                                setHwAndSleepPortStt(stt, hwAccess, setSleepPortStt)
                            }}
                            checkedStr={"FW Update"}
                            unCheckedStr={'Normal Reset'}
                            transformDurationMs={500}
                            checkedColor='blue'
                            unCheckedBackgroundColor='rgb(208,208,208)'
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
