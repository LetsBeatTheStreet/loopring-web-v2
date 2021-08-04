import { Button } from '../../basic-lib';
import { Box, Typography } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';


export const FailedConnect = ({handleRetry,t}: { handleRetry:(event:any)=>void } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelMetaMaskProcessing')}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <img width={60} height={60} src={loadingSvg}
                 alt={'loading'} />
            <Typography component={'span'}>{t('labelProcessing')}</Typography>
        </Typography>
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
        <Button onClick={handleRetry}>Retry</Button>

    </Box>

}
