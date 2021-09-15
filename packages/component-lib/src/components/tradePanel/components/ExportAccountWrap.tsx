import React from 'react'
import { WithTranslation } from 'react-i18next';
import { Grid, Typography, TextareaAutosize } from '@mui/material';
import { Button } from '../../basic-lib';
import { ExportAccountExtendProps } from './Interface';
import styled from '@emotion/styled'
import { Toast } from '@loopring-web/component-lib'
import { copyToClipBoard } from '@loopring-web/common-resources'

const TOAST_TIME = 3000

const TextareaAutosizeStyled = styled(TextareaAutosize)`
    width: 100%;
    padding: ${({theme}: any) => theme.unit * 2}px;
    color: var(--color-text-secondary);
    background: var(--color-global-bg);
` as any

export const ExportAccountWrap = ({
           t,
           ...rest
       }: ExportAccountExtendProps & WithTranslation) => {
    const [info, setInfo] = React.useState<any>()
    const [copyToastOpen, setCopyToastOpen] = React.useState(false)
    const { exportAccountProps: {accountInfo} } = rest

    // console.log({exportAccountProps})
    React.useEffect(() => {
        if (accountInfo) {
            try{
                const info = JSON.stringify(accountInfo, null, 4)
                setInfo(info)
            }
            finally{

            }
        }
    }, [accountInfo])

    return <Grid className={''} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Typography component={'h4'} textAlign={'center'} variant={'h3'} marginBottom={2}>
                {t('labelExportAccount')}
            </Typography>
            <Typography variant={'body2'} textAlign={'center'} color={'var(--color-text-third)'} marginBottom={2}>
                {t('labelExportAccountNoPhotos')}
            </Typography>
        </Grid>

        <Grid item alignSelf={"stretch"} marginBottom={1} position={'relative'}>
            <Typography component={'p'} variant="body1" color={'var(--color-text-third)'}>
                {t('labelExportAccountDescription')}
            </Typography>
        </Grid>

        <Grid item alignSelf={"stretch"} position={'relative'}>
            <TextareaAutosizeStyled
                disabled
                maxRows={15}
                defaultValue={info}
            ></TextareaAutosizeStyled>
        </Grid>

        <Grid item marginTop={2} alignSelf={'stretch'}>
            <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                copyToClipBoard(info)
                setCopyToastOpen(true)
            }}
            >{t(`labelExportAccountCopy`)}
            </Button>
        </Grid>
        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
            autoHideDuration={TOAST_TIME} onClose={() => {
                setCopyToastOpen(false)
            }} severity={"success"}/>
    </Grid>
}
