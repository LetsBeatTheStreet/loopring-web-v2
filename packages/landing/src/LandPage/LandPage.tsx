import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import styled from '@emotion/styled/';
import { DropDownIcon, getValuePrecisionThousand, ThemeType } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { Card } from './Card';
import { useHistory } from 'react-router-dom';
import { LoopringAPI } from '../../api_wrapper';


const HeightConfig = {
    headerHeight: 64,
    whiteHeight: 32,
    maxHeight: 836,
    minHeight: 800,
}

const CardBox = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  // .MuiGrid-grid-xs-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 10}px;
  // }
  // .MuiGrid-grid-md-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 6}px;
  // }
  // .MuiGrid-grid-lg-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 10}px;
  // }
  // .MuiGrid-grid-xl-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 30}px;
  // }
  .card {
    display: flex;
    margin: 0 8px;
    border-radius: 4px;
    flex-direction: column;
    align-items: center;
    position: relative;
    box-shadow: var(--box-card-shadow);
  }
` as typeof Box

const ContainerStyle = styled(Box)`
  .MuiContainer-root {
    min-width: 1200px;
  }

  ${({theme}) => {
    let result = `
       --img-banner-url: url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
      result += `
            --main-page-bg: #04092E;
            --color-primary: #4169FF;
            --layer-2:#1F2034;
            --box-card-decorate:rgba(255, 255, 255, 0.1);
            --box-card-background:#2D2F4B;
            --box-card-background-hover:#4169FF;
            --box-card-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15); 
            --text-secondary: #687295;
            --border-card:1px solid #49527D;
            --border-card-hover: rgba(255, 255, 255, 0.1);
            --text-highlight:#4169FF;
            --text-third:#ffffff; 
          `
    } else {
      result += `
            --main-page-bg: #ffffff;
            --color-primary: #3B5AF4;
            --layer-2:#F6F7FB;
            --box-card-decorate:rgba(255, 255, 255, 0);
            --box-card-background:#ffffff;
            --box-card-background-hover:#3B5AF4;
            --box-card-shadow: 0px 10px 20px rgba(87, 129, 236, 0.1);
            --text-secondary: #A3A8CA;
            --border-card:1px solid #E9EAF2;
            --border-card-hover: rgba(255, 255, 255, 0.1);
             --text-highlight:#4169FF;
             --text-third:#ffffff;


            `
    }
    return result;
  }};
  background: var(--main-page-bg);

  body {
    background: var(--main-page-bg)
  }

`
const GridBg = styled(Grid)`
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: 120px calc(50% - -40px);
  //background-image: var(--img-banner-url);


  ${({theme}) => {
    return `
     background-image: image-set(url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.webp") 1x,
      url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png") 1x);
        `
  }} //background-image: url("http://static.loopring.io/assets/images/landPage/img_home_banner_dark@2x.png");

` as typeof Grid


const BottomBanner = styled(Box)`
  //background-size: 100%;
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: cover;
  background-image: image-set(url("http://static.loopring.io/assets/images/landPage/img_home_agreement@1x.webp") 1x,
  url("http://static.loopring.io/assets/images/landPage/img_home_agreement@1x.png") 1x);
  //mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
` as typeof Box


const TitleTypography = styled(Typography)`
  text-transform: uppercase;
  font-size: 5.6rem;
  font-weight: 700;
  white-space: pre-line;
  line-height: 9.6rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    width: 96px;
    display: block;
    background: var(--color-primary);
  }
` as typeof Typography
const BoxCard = styled(Box)`
  position: absolute;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--box-card-background);
  box-shadow: var(--box-card-shadow);

  h4 {
    text-transform: uppercase;
    font-size: 30px;
    font-weight: 500;
  }

  :before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    display: block;
    border-start-end-radius: 4px;
    border-end-end-radius: 4px;

    background: var(--box-card-decorate);
  }
` as typeof Box


export const LandPage = withTranslation(['landPage', 'common'])(({t}: any) => {
    // const value = {}
    const [size, setSize] = React.useState<[number, number]>([1200, 0]);

    const [value, setValue] = React.useState<{
        timestamp: string
        tradeVolume: string,
        totalUserNum: string,
        tradeNum: string,
        layerTwoLockedVolume: string
    } | undefined>();
    // const theme = useTheme();
    const history = useHistory()
    React.useLayoutEffect(() => {
        function updateSize() {
            setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);

        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const result = React.useCallback(async () => {
        if (LoopringAPI.exchangeAPI) {
            const {
                timestamp,
                tradeVolume,
                totalUserNum,
                tradeNum,
                layerTwoLockedVolume
            } = await LoopringAPI.exchangeAPI.getProtocolPortrait()
            setValue({
                timestamp,
                tradeVolume,
                totalUserNum,
                tradeNum,
                layerTwoLockedVolume
            })
            // orderbookTradingFees: VipFeeRateInfoMap;
            // ammTradingFees: VipFeeRateInfoMap;
            // otherFees: {
            //     [key: string]: string;
            // };
            // raw_data: any;
            // raw_data.
            //setVipTable(raw_data)
        }

        // setUserFee(userFee)


    }, [])
    React.useEffect(() => {
        result()
    }, [])

    return <ContainerStyle>
        <Box>
            <Container>
                <GridBg item xs={12}
                        maxHeight={HeightConfig.maxHeight}
                        minHeight={HeightConfig.minHeight}
                        position={'relative'}
                        height={size[ 1 ]}>
                    {/*<picture style={{'absolute'}}  >*/}
                    {/*    <source*/}
                    {/*        srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.webp 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.webp 2x`}*/}
                    {/*        type="image/webp"/>*/}
                    {/*    <source*/}
                    {/*        srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*    />*/}
                    {/*    <img srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*         alt="img-banner"/>*/}
                    {/*</picture>*/}
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>

                        <Typography component={'h2'}
                                    color={'var(--color-primary)'}
                                    style={{
                                        letterSpacing: '0.4em',
                                        textTransform: 'uppercase'
                                    }}>
                            {t('labelProtocol')}
                        </Typography>
                        <Typography component={'h1'} fontSize={80} marginTop={4} whiteSpace={'pre-line'}
                                    lineHeight={'96px'}>
                            {t('labelH1Title')}
                        </Typography>
                        <Typography marginTop={10} width={260}>
                            <Button onClick={() => history.push('/layer2')} fullWidth={true} size={'large'}
                                    variant={'contained'}
                                    style={{
                                        height: 64,
                                        justifyContent: 'space-around',
                                        borderRadius: '0', textTransform: 'uppercase'
                                    }}>
                                {t('labelBtnStart')}
                                <i><DropDownIcon style={{transform: 'rotate(-90deg) scale(1.5)'}}/></i>
                            </Button>
                        </Typography>
                    </Box>

                </GridBg>

            </Container>
        </Box>
        <Box style={{background: 'var(--layer-2)'}}>
            <Container>
                <Grid item xs={12}
                      maxHeight={HeightConfig.maxHeight}
                      minHeight={HeightConfig.minHeight}
                      position={'relative'}
                      height={size[ 1 ]}>
                    <Box position={'absolute'} width={'100%'} height={768} zIndex={33}
                         left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>
                        <TitleTypography position={'absolute'} component={'h3'} zIndex={44}>
                            {t('labelTitleDEX')}
                        </TitleTypography>
                        <BoxCard width={320} height={320} top={150} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeVolume')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 72, fontWeight: 700}}>
                                ${value && getValuePrecisionThousand(
                                value.tradeVolume, 1, 1, 1, false, {abbreviate: 3, isAbbreviate: true}
                            )}</Typography>
                        </BoxCard>
                        <BoxCard width={340} height={340} top={214} left={394} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeUser')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 90, fontWeight: 700}}>
                                {value && getValuePrecisionThousand(
                                    value.totalUserNum, 1, 1, 1, true, {abbreviate: 3, isAbbreviate: true}
                                )}</Typography>
                        </BoxCard>
                        <BoxCard width={264} height={264} top={32} left={798} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeTVL')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 64, fontWeight: 700}}> ${value && getValuePrecisionThousand(
                                value.layerTwoLockedVolume, 1, 1, 1, true, {abbreviate: 3, isAbbreviate: true}
                            )}</Typography>
                        </BoxCard>
                        <BoxCard width={400} height={400} top={363} left={798} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeNofTrades')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 120, fontWeight: 700}}>{value && getValuePrecisionThousand(
                                value.tradeNum, 1, 1, 1, true, {abbreviate: 3, isAbbreviate: true}
                            )}</Typography>
                        </BoxCard>
                    </Box>
                </Grid>
            </Container>
        </Box>
        <Box marginBottom={10}>
            <Container>
                <Grid item xs={12}>
                    <TitleTypography component={'h3'} marginTop={10} marginBottom={6}>
                        {t('labelZeroKpt')}
                    </TitleTypography>
                    <CardBox height={640} position={'relative'}>
                        <Card
                            title={'labelSafety'}
                            describe={'describeSafety'}
                            icon={<svg
                                width="180" height="180" viewBox="0 0 180 180" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M89.7617 110.393C89.803 110.392 89.8446 110.393 89.8863 110.394C93.3445 110.538 96.5175 111.633 98.7739 112.646C99.9136 113.158 100.848 113.662 101.503 114.041C101.831 114.231 102.09 114.391 102.272 114.506C102.363 114.563 102.434 114.61 102.486 114.644C102.511 114.66 102.532 114.674 102.547 114.684L102.566 114.697L102.572 114.701L102.576 114.704C102.576 114.704 102.577 114.704 101.356 116.495C103.523 116.435 103.523 116.436 103.523 116.437L103.523 116.439L103.523 116.445L103.523 116.46C103.524 116.472 103.524 116.488 103.524 116.507C103.525 116.546 103.525 116.6 103.526 116.668C103.526 116.803 103.524 116.995 103.518 117.236C103.505 117.719 103.473 118.401 103.394 119.233C103.238 120.892 102.896 123.171 102.149 125.645C100.663 130.568 97.4815 136.53 90.7016 139.645C90.3922 139.787 90.0666 139.85 89.7476 139.843C89.4264 139.845 89.1037 139.777 88.8041 139.635C82.1903 136.508 79.1034 130.536 77.6639 125.629C76.9391 123.158 76.6074 120.883 76.4557 119.228C76.3796 118.397 76.3482 117.716 76.3359 117.235C76.3297 116.994 76.3284 116.803 76.3286 116.668C76.3288 116.601 76.3293 116.547 76.3299 116.508C76.3302 116.489 76.3305 116.473 76.3308 116.461L76.3311 116.446L76.3312 116.441L76.3313 116.439C76.3313 116.438 76.3313 116.437 78.4978 116.495C77.2533 114.721 77.2538 114.721 77.2542 114.72L77.2578 114.718L77.2642 114.713L77.2828 114.701C77.2978 114.69 77.3179 114.676 77.3429 114.66C77.3929 114.626 77.4629 114.579 77.5516 114.521C77.7289 114.405 77.9819 114.245 78.3015 114.055C78.9395 113.674 79.8499 113.169 80.9606 112.656C83.1582 111.64 86.2563 110.539 89.6383 110.395C89.6795 110.393 89.7207 110.392 89.7617 110.393ZM87.5633 115C85.7914 115.347 84.1366 115.963 82.7789 116.59C81.9255 116.985 81.2125 117.373 80.69 117.678C80.7062 118.004 80.7318 118.393 80.7721 118.832C80.9054 120.287 81.1966 122.273 81.8231 124.409C82.7959 127.725 84.5197 131.226 87.5633 133.749V115ZM91.8977 133.883V114.974C93.7912 115.317 95.5588 115.954 96.9983 116.6C97.8834 116.998 98.6222 117.389 99.1624 117.695C99.1457 118.017 99.1196 118.397 99.0791 118.826C98.9422 120.278 98.643 122.261 97.9995 124.393C96.9821 127.762 95.1602 131.341 91.8977 133.883ZM78.4978 116.495L77.2533 114.721C76.6918 115.115 76.3498 115.751 76.3313 116.437L78.4978 116.495ZM101.356 116.495L103.523 116.435C103.503 115.74 103.152 115.096 102.577 114.704L101.356 116.495Z"
                                      className="svg-high"/>
                                <path
                                    d="M60.552 69.7206C60.552 68.5237 61.5223 67.5534 62.7192 67.5534H116.742C117.938 67.5534 118.909 68.5237 118.909 69.7206C118.909 70.9175 117.938 71.8878 116.742 71.8878H62.7192C61.5223 71.8878 60.552 70.9175 60.552 69.7206Z"/>
                                <path
                                    d="M60.552 84.2707C60.552 83.0738 61.5223 82.1035 62.7192 82.1035H116.742C117.938 82.1035 118.909 83.0738 118.909 84.2707C118.909 85.4676 117.938 86.4379 116.742 86.4379H62.7192C61.5223 86.4379 60.552 85.4676 60.552 84.2707Z"/>
                                <path
                                    d="M60.5527 98.8205C60.5527 97.6235 61.523 96.6532 62.72 96.6532H90.5177C91.7146 96.6532 92.6849 97.6235 92.6849 98.8205C92.6849 100.017 91.7146 100.988 90.5177 100.988H62.72C61.523 100.988 60.5527 100.017 60.5527 98.8205Z"/>
                                <path
                                    d="M99.8215 98.8205C99.8215 97.6235 100.792 96.6532 101.989 96.6532H116.742C117.938 96.6532 118.909 97.6235 118.909 98.8205C118.909 100.017 117.938 100.988 116.742 100.988H101.989C100.792 100.988 99.8215 100.017 99.8215 98.8205Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M48.4207 33.3837C48.4207 32.0964 49.4643 31.0527 50.7517 31.0527H106.553C107.171 31.0527 107.764 31.2983 108.201 31.7355L129.565 53.0997C130.002 53.5368 130.248 54.1297 130.248 54.7479V149.175C130.254 149.49 130.196 149.808 130.07 150.111C129.71 150.982 128.86 151.55 127.917 151.55H50.7517C49.4643 151.55 48.4207 150.507 48.4207 149.219V33.3837ZM125.586 55.7793V146.888H53.0827V35.7147H104.364V53.9812C104.364 55.2685 105.408 56.3122 106.695 56.3122H124.102C124.666 56.3122 125.183 56.1122 125.586 55.7793ZM109.026 39.1541L121.522 51.6502H109.026V39.1541Z"/>
                            </svg>
                            }/>
                        <Card
                            title={'labelLowCost'}
                            describe={'describeLowCost'}
                            icon={<svg width="200" height="200" viewBox="0 0 200 200" fill="none"
                                       xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M117.03 61.519C93.3348 61.519 74.1258 80.728 74.1258 104.423C74.1258 128.118 93.3344 147.327 117.03 147.327C140.725 147.327 159.934 128.118 159.934 104.423C159.934 80.7279 140.725 61.519 117.03 61.519ZM69.6096 104.423C69.6096 78.2337 90.8406 57.0027 117.03 57.0027C143.22 57.0027 164.45 78.2337 164.45 104.423C164.45 130.613 143.219 151.843 117.03 151.843C90.8402 151.843 69.6096 130.613 69.6096 104.423Z"/>
                                <path
                                    d="M45.9081 61.4113C45.9081 56.7185 49.7102 52.9166 54.4031 52.9166H123.221C127.076 52.9166 130.33 55.4818 131.369 58.9989C133.026 59.5154 134.645 60.12 136.219 60.8072C135.903 53.9006 130.206 48.4004 123.221 48.4004H54.4031C47.2161 48.4004 41.3918 54.2241 41.3918 61.4113C41.3918 64.8611 42.7337 67.9967 44.924 70.325C39.329 71.7808 35.1998 76.8657 35.1998 82.9173C35.1998 89.6971 40.3825 95.2636 47.0029 95.8729C45.008 98.1592 43.7998 101.15 43.7998 104.423C43.7998 107.697 45.0079 110.687 47.0025 112.973C40.3824 113.583 35.1998 119.149 35.1998 125.929C35.1998 133.116 41.0241 138.94 48.2111 138.94H84.3821C82.8964 137.526 81.502 136.018 80.2085 134.424H48.2111C43.5182 134.424 39.7161 130.622 39.7161 125.929C39.7161 121.236 43.5182 117.434 48.2111 117.434H71.3813C70.9634 115.957 70.6151 114.45 70.34 112.918H56.8111C52.1182 112.918 48.3161 109.116 48.3161 104.423C48.3161 99.7305 52.1182 95.9286 56.8111 95.9286H70.3501C70.6271 94.3963 70.9775 92.8895 71.3974 91.412H48.2111C43.5182 91.412 39.7161 87.6101 39.7161 82.9173C39.7161 78.2245 43.5182 74.4226 48.2111 74.4226H80.2545C81.5524 72.8282 82.9515 71.3194 84.442 69.906H54.4031C49.7102 69.906 45.9081 66.1041 45.9081 61.4113Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M117.03 76.0611C101.365 76.0611 88.6682 88.7582 88.6682 104.423C88.6682 120.088 101.365 132.785 117.03 132.785C132.695 132.785 145.392 120.088 145.392 104.423C145.392 88.7582 132.695 76.0611 117.03 76.0611ZM84.152 104.423C84.152 86.2639 98.871 71.5449 117.03 71.5449C135.189 71.5449 149.908 86.2639 149.908 104.423C149.908 122.582 135.189 137.301 117.03 137.301C98.871 137.301 84.152 122.582 84.152 104.423Z"
                                      className="svg-high"/>
                            </svg>

                            }/>
                        <Card
                            title={'labelFastTransfer'}
                            describe={'describeFastTransfer'}
                            icon={<svg width="180" height="180" viewBox="0 0 180 180" fill="none"
                                       xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M111.271 53.3278C111.271 40.3568 121.785 29.8418 134.757 29.8418C147.728 29.8418 158.243 40.3568 158.243 53.3278C158.243 66.2989 147.728 76.8139 134.757 76.8139C121.785 76.8139 111.271 66.2989 111.271 53.3278ZM134.757 34.1762C124.179 34.1762 115.605 42.7506 115.605 53.3278C115.605 63.9051 124.179 72.4795 134.757 72.4795C145.334 72.4795 153.908 63.9051 153.908 53.3278C153.908 42.7506 145.334 34.1762 134.757 34.1762Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M111.271 126.406C111.271 113.435 121.785 102.92 134.757 102.92C147.728 102.92 158.243 113.435 158.243 126.406C158.243 139.377 147.728 149.892 134.757 149.892C121.785 149.892 111.271 139.377 111.271 126.406ZM134.757 107.254C124.179 107.254 115.605 115.829 115.605 126.406C115.605 136.983 124.179 145.558 134.757 145.558C145.334 145.558 153.908 136.983 153.908 126.406C153.908 115.829 145.334 107.254 134.757 107.254Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M37.5635 81.0406C37.5635 77.3574 40.552 74.377 44.2307 74.377C47.9093 74.377 50.8979 77.3574 50.8979 81.0406C50.8979 84.7215 47.9116 87.7078 44.2307 87.7078C40.5498 87.7078 37.5635 84.7215 37.5635 81.0406ZM44.2307 78.7114C42.9413 78.7114 41.8979 79.7557 41.8979 81.0406C41.8979 82.3276 42.9436 83.3734 44.2307 83.3734C45.5178 83.3734 46.5635 82.3276 46.5635 81.0406C46.5635 79.7557 45.52 78.7114 44.2307 78.7114Z"/>
                                <path
                                    d="M40.4193 100.046L63.4377 77.0242L66.5028 80.0889L43.4844 103.111L40.4193 100.046Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M55.5599 98.9614C55.5599 95.2827 58.5403 92.2942 62.2235 92.2942C65.9044 92.2942 68.8907 95.2804 68.8907 98.9614C68.8907 102.645 65.9021 105.625 62.2235 105.625C58.5426 105.625 55.5599 102.642 55.5599 98.9614ZM62.2235 96.6286C60.9386 96.6286 59.8943 97.672 59.8943 98.9614C59.8943 100.248 60.9364 101.291 62.2235 101.291C63.5128 101.291 64.5563 100.246 64.5563 98.9614C64.5563 97.6743 63.5106 96.6286 62.2235 96.6286Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M53.227 56.8633C34.9265 56.8633 20.0908 71.699 20.0908 89.9995C20.0908 108.3 34.9265 123.136 53.227 123.136C71.5275 123.136 86.3632 108.3 86.3632 89.9995C86.3632 71.699 71.5275 56.8633 53.227 56.8633ZM24.4252 89.9995C24.4252 74.0928 37.3203 61.1977 53.227 61.1977C69.1337 61.1977 82.0288 74.0928 82.0288 89.9995C82.0288 105.906 69.1337 118.801 53.227 118.801C37.3203 118.801 24.4252 105.906 24.4252 89.9995Z"/>
                                <path
                                    d="M106.254 68.4535C107.336 67.9424 107.799 66.6506 107.288 65.5684C106.777 64.4861 105.485 64.0231 104.403 64.5342L89.7358 71.4614C88.6535 71.9725 88.1905 73.2642 88.7016 74.3465C89.2128 75.4288 90.5045 75.8918 91.5868 75.3806L106.254 68.4535Z"/>
                                <path
                                    d="M91.507 105.634C90.4116 105.152 89.1326 105.649 88.6502 106.744C88.1678 107.839 88.6647 109.118 89.7601 109.601L104.416 116.055C105.512 116.538 106.791 116.041 107.273 114.945C107.756 113.85 107.259 112.571 106.163 112.088L91.507 105.634Z"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M134.551 38.5472C134.078 38.6245 133.701 38.8099 133.35 39.1376C133.057 39.4111 132.855 39.7417 132.736 40.1393L132.681 40.3211L132.67 41.6178L132.659 42.9146L132.327 43.0212C132.144 43.0798 131.892 43.1704 131.767 43.2225C130.74 43.6483 129.726 44.3924 129.059 45.21C129 45.2821 128.936 45.3592 128.917 45.3814C128.898 45.4036 128.826 45.5034 128.757 45.6031C127.978 46.7207 127.634 47.8759 127.676 49.232C127.689 49.6647 127.72 49.9131 127.806 50.2865C128.173 51.8855 129.252 53.1383 130.991 53.9816C131.893 54.4193 132.789 54.7236 134.578 55.1998C136.815 55.7955 137.694 56.1491 138.184 56.6503C138.427 56.899 138.521 57.1539 138.525 57.5784C138.528 57.9151 138.445 58.1635 138.232 58.455C137.628 59.284 136.145 59.7263 134.62 59.5324C133.183 59.3498 131.842 58.6426 130.916 57.5793C130.594 57.2092 130.514 57.1334 130.3 56.9929C129.311 56.3432 128.008 56.5384 127.27 57.4469C127.111 57.6424 126.938 57.9863 126.868 58.2437C126.789 58.5372 126.778 58.9126 126.839 59.1998C126.939 59.6738 127.07 59.8987 127.603 60.5118C127.78 60.7151 128.402 61.3074 128.665 61.5222C129.733 62.3962 130.89 63.0241 132.202 63.4421C132.396 63.5039 132.581 63.5603 132.612 63.5675L132.669 63.5806V64.8358C132.669 65.8491 132.675 66.1235 132.7 66.2599C132.851 67.1001 133.501 67.7705 134.381 67.9935C134.542 68.0343 134.614 68.0406 134.91 68.0394C135.209 68.0382 135.277 68.0315 135.453 67.9858C135.846 67.884 136.197 67.6886 136.478 67.415C136.843 67.0594 137.094 66.5458 137.122 66.0963C137.128 66.002 137.135 65.4399 137.136 64.8471L137.14 63.7692L137.223 63.7518C137.581 63.6763 138.049 63.5519 138.354 63.4507C139.766 62.9815 140.908 62.2071 141.749 61.1469C141.824 61.053 142.109 60.6537 142.109 60.6432C142.109 60.6393 142.151 60.5666 142.202 60.4816C142.624 59.7884 142.896 58.9817 142.979 58.1761C143.007 57.9091 143.007 57.3202 142.979 57.0341C142.909 56.2954 142.732 55.6587 142.432 55.0584C142.125 54.4452 141.85 54.0672 141.357 53.5806C140.897 53.1269 140.411 52.7724 139.775 52.4265C139.54 52.2992 139.015 52.0444 138.987 52.0444C138.981 52.0444 138.928 52.0222 138.868 51.9951C138.342 51.7585 137.37 51.4404 136.217 51.1275C134.202 50.5808 133.643 50.4051 133.084 50.1431C132.629 49.9299 132.341 49.7091 132.229 49.4891L132.161 49.3537L132.161 49.0106C132.161 48.6778 132.163 48.6622 132.226 48.4907C132.327 48.2162 132.462 48.0144 132.711 47.7691C133.145 47.34 133.638 47.1139 134.35 47.0169C134.693 46.9701 135.572 46.9849 135.885 47.0428C136.402 47.1384 136.77 47.2517 137.163 47.4361C137.526 47.6065 137.785 47.7789 138.012 48.0004C138.251 48.233 138.339 48.3652 138.458 48.6685C138.616 49.073 138.799 49.343 139.081 49.5913C139.505 49.964 140.012 50.1507 140.602 50.1507C140.835 50.1507 140.91 50.142 141.114 50.0918C141.82 49.9187 142.363 49.4683 142.644 48.8243C142.776 48.5202 142.803 48.3786 142.803 47.982C142.802 47.5697 142.783 47.4714 142.613 47.0345C142.048 45.5854 140.846 44.361 139.21 43.5692C138.576 43.2619 137.838 43.0044 137.187 42.8631L137.131 42.8509L137.131 41.6565C137.131 40.66 137.126 40.435 137.099 40.2981C136.968 39.6333 136.544 39.0797 135.928 38.7706C135.489 38.5502 135.009 38.4724 134.551 38.5472Z"
                                      className="svg-high"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M44.2302 78.7094C42.9428 78.7094 41.8989 79.7533 41.8989 81.0408C41.8989 82.3282 42.9428 83.3721 44.2302 83.3721C45.5177 83.3721 46.5616 82.3282 46.5616 81.0408C46.5616 79.7533 45.5177 78.7094 44.2302 78.7094ZM37.5645 81.0408C37.5645 77.3595 40.5489 74.375 44.2302 74.375C47.9115 74.375 50.896 77.3595 50.896 81.0408C50.896 84.722 47.9115 87.7065 44.2302 87.7065C40.5489 87.7065 37.5645 84.722 37.5645 81.0408ZM66.5023 77.0247C67.3486 77.871 67.3486 79.2432 66.5023 80.0896L43.4831 103.109C42.6368 103.955 41.2646 103.955 40.4183 103.109C39.5719 102.262 39.5719 100.89 40.4183 100.044L63.4374 77.0247C64.2837 76.1783 65.6559 76.1783 66.5023 77.0247ZM62.2241 96.628C60.9366 96.628 59.8927 97.672 59.8927 98.9594C59.8927 100.247 60.9366 101.291 62.2241 101.291C63.5115 101.291 64.5555 100.247 64.5555 98.9594C64.5555 97.672 63.5115 96.628 62.2241 96.628ZM55.5583 98.9594C55.5583 95.2781 58.5428 92.2936 62.2241 92.2936C65.9054 92.2936 68.8899 95.2781 68.8899 98.9594C68.8899 102.641 65.9054 105.625 62.2241 105.625C58.5428 105.625 55.5583 102.641 55.5583 98.9594Z"
                                      className="svg-high"/>
                                <path fillRule="evenodd" clipRule="evenodd"
                                      d="M134.551 111.627C134.078 111.705 133.701 111.89 133.35 112.218C133.057 112.491 132.855 112.822 132.736 113.219L132.681 113.401L132.67 114.698L132.659 115.995L132.327 116.101C132.144 116.16 131.892 116.25 131.767 116.303C130.74 116.728 129.726 117.472 129.059 118.29C129 118.362 128.936 118.439 128.917 118.461C128.898 118.484 128.826 118.583 128.757 118.683C127.978 119.801 127.634 120.956 127.676 122.312C127.689 122.745 127.72 122.993 127.806 123.367C128.173 124.966 129.252 126.218 130.991 127.062C131.893 127.499 132.789 127.804 134.578 128.28C136.815 128.876 137.694 129.229 138.184 129.73C138.427 129.979 138.521 130.234 138.525 130.659C138.528 130.995 138.445 131.244 138.232 131.535C137.628 132.364 136.145 132.806 134.62 132.612C133.183 132.43 131.842 131.723 130.916 130.659C130.594 130.289 130.514 130.214 130.3 130.073C129.311 129.423 128.008 129.619 127.27 130.527C127.111 130.722 126.938 131.066 126.868 131.324C126.789 131.617 126.778 131.993 126.839 132.28C126.939 132.754 127.07 132.979 127.603 133.592C127.78 133.795 128.402 134.387 128.665 134.602C129.733 135.476 130.89 136.104 132.202 136.522C132.396 136.584 132.581 136.64 132.612 136.648L132.669 136.661V137.916C132.669 138.929 132.675 139.204 132.7 139.34C132.851 140.18 133.501 140.851 134.381 141.074C134.542 141.114 134.614 141.121 134.91 141.119C135.209 141.118 135.277 141.112 135.453 141.066C135.846 140.964 136.197 140.769 136.478 140.495C136.843 140.139 137.094 139.626 137.122 139.176C137.128 139.082 137.135 138.52 137.136 137.927L137.14 136.849L137.223 136.832C137.581 136.756 138.049 136.632 138.354 136.531C139.766 136.062 140.908 135.287 141.749 134.227C141.824 134.133 142.109 133.734 142.109 133.723C142.109 133.719 142.151 133.647 142.202 133.562C142.624 132.868 142.896 132.062 142.979 131.256C143.007 130.989 143.007 130.4 142.979 130.114C142.909 129.375 142.732 128.739 142.432 128.138C142.125 127.525 141.85 127.147 141.357 126.661C140.897 126.207 140.411 125.853 139.775 125.507C139.54 125.379 139.015 125.124 138.987 125.124C138.981 125.124 138.928 125.102 138.868 125.075C138.342 124.839 137.37 124.521 136.217 124.208C134.202 123.661 133.643 123.485 133.084 123.223C132.629 123.01 132.341 122.789 132.229 122.569L132.161 122.434L132.161 122.091C132.161 121.758 132.163 121.742 132.226 121.571C132.327 121.296 132.462 121.094 132.711 120.849C133.145 120.42 133.638 120.194 134.35 120.097C134.693 120.05 135.572 120.065 135.885 120.123C136.402 120.219 136.77 120.332 137.163 120.516C137.526 120.687 137.785 120.859 138.012 121.08C138.251 121.313 138.339 121.445 138.458 121.749C138.616 122.153 138.799 122.423 139.081 122.671C139.505 123.044 140.012 123.231 140.602 123.231C140.835 123.231 140.91 123.222 141.114 123.172C141.82 122.999 142.363 122.548 142.644 121.904C142.776 121.6 142.803 121.459 142.803 121.062C142.802 120.65 142.783 120.551 142.613 120.115C142.048 118.665 140.846 117.441 139.21 116.649C138.576 116.342 137.838 116.084 137.187 115.943L137.131 115.931L137.131 114.737C137.131 113.74 137.126 113.515 137.099 113.378C136.968 112.713 136.544 112.16 135.928 111.851C135.489 111.63 135.009 111.552 134.551 111.627Z"
                                      className="svg-high"/>
                            </svg>
                            }/>

                    </CardBox>

                </Grid>
            </Container>
        </Box>
        <BottomBanner height={400}>
            <Container>
                <Grid item xs={12} position={'relative'} height={400}>
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>
                        <Typography
                            color={'var(--text-highlight)'}
                            component={'h4'}
                            marginTop={4} whiteSpace={'pre-line'}
                            variant={'h3'}>
                            {t('labelSuperpowers')}
                        </Typography>

                        <Typography marginTop={3} width={480} color={'var(--text-third)'}>
                            {t('describeSuperpowers')}
                        </Typography>
                        <Typography marginTop={8} width={260}>
                            <Button onClick={() => history.push('/layer2')} fullWidth={true} size={'large'}
                                    variant={'contained'}
                                    style={{
                                        height: 64,
                                        justifyContent: 'space-around',
                                        borderRadius: '0', textTransform: 'uppercase'
                                    }}>
                                {t('labelBtnStart')}
                                <i><DropDownIcon style={{transform: 'rotate(-90deg) scale(1.5)'}}/></i>
                            </Button>
                        </Typography>

                    </Box>

                </Grid>
            </Container>
        </BottomBanner>
        {/*<Box>*/}
        {/*    <Container>*/}
        {/*     */}
        {/*    </Container>*/}
        {/*</Box>*/}
    </ContainerStyle>
})
