import { useState, useEffect } from 'react'
import { initOnboard } from '../utils/onboard'
import { config } from '../dapp.config'
import { ethers } from 'ethers'
import Clipboard from 'clipboard'
import {
  getMinteState,
  getListMinteState,
  getPrice,
  publicMint,
  gettMintAmount,
  listMint
} from '../utils/interact'
import { useRouter } from 'next/router'
import Dialog from '@mui/material/Dialog'
const wei = 10 ** 18
export default function Mint() {
  const router = useRouter()
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalMinted, setTotalMinted] = useState(0)
  const [maxMintAmount, setMaxMintAmount] = useState(0)
  const [price, setPrice] = useState(0)
  const [mintState, setMintState] = useState(true)
  const [listMintState, setListMintState] = useState(true)
  const [paused, setPaused] = useState(true)
  const [isPreSale, setIsPreSale] = useState(false)

  const [status, setStatus] = useState(null)
  const [mintAmount, setMintAmount] = useState(1)
  const [isMinting, setIsMinting] = useState(false)
  const [onboard, setOnboard] = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [inviteJsonObj, setInviteJsonObj] = useState([])
  const [openLinkDialog, setOpenLinkDialog] = useState(false)

  useEffect(() => {
    setMaxMintAmount(config.maxMintAmount)

    const init = async () => {
      setMintState(await getMinteState())
      setListMintState(await getListMinteState())
      setPrice(await getPrice())
      // setMaxSupply(await getMaxSupply())
      // setTotalMinted(await getTotalMinted())
      // setPaused(true)
      // setIsPublicSale(await isPublicSaleState())
      // const isPreSale = await isPreSaleState()
    }
    if (walletAddress) init()
  }, [walletAddress])

  useEffect(() => {
    const onboardData = initOnboard({
      address: (address) => setWalletAddress(address ? address : ''),
      wallet: (wallet) => {
        if (wallet.provider) {
          window.localStorage.setItem('selectedWallet', wallet.name)
        } else {
          window.localStorage.removeItem('selectedWallet')
        }
      }
    })

    setOnboard(onboardData)
  }, [])

  useEffect(() => {
    getInviteData()
  }, [])

  async function getInviteData() {
    let inviteObj = JSON.parse(localStorage.getItem('inviteObj') || '[]')
    setInviteJsonObj(inviteObj)
  }

  const previouslySelectedWallet =
    typeof window !== 'undefined' &&
    window.localStorage.getItem('selectedWallet')

  useEffect(() => {
    if (previouslySelectedWallet !== null && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }, [onboard, previouslySelectedWallet])

  const connectWalletHandler = async () => {
    const walletSelected = await onboard.walletSelect()
    if (walletSelected) {
      await onboard.walletCheck()
      window.location.reload(true)
    }
  }

  const incrementMintAmount = () => {
    if (mintAmount < maxMintAmount) {
      setMintAmount(mintAmount + 1)
    }
  }

  const decrementMintAmount = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1)
    }
  }

  const publicMintHandler = async () => {
    setIsMinting(true)

    if (ethers.utils.formatUnits(price) <= 0) {
      setStatus({
        success: false,
        message: 'Illegal price'
      })
      setIsMinting(false)
      return
    }
    if (mintState) {
      const canMint = await gettMintAmount()
      if (!canMint) {
        setStatus({
          success: false,
          message: "You can't mint anymore"
        })
        setIsMinting(false)
        return
      }
      const { success, status } = await publicMint(mintAmount, price)

      setStatus({
        success,
        message: status
      })

      setIsMinting(false)
      return
    }

    if (listMintState) {
      const { success, status } = await listMint(mintAmount, price)

      setStatus({
        success,
        message: status
      })

      setIsMinting(false)
    }
  }

  function onCreateInviteLink() {
    if (!walletAddress) {
      alert('Please connect wallet')
      return
    }
    const link =
      window.location.origin +
      window.location.pathname +
      '?ar=' +
      walletAddress.toLowerCase()
    setShareLink(link)
    inviteJsonObj.push({
      addr: walletAddress,
      time: new Date().toUTCString()
    })

    setInviteJsonObj([...inviteJsonObj])
    localStorage.setItem('inviteObj', JSON.stringify(inviteJsonObj))
    setOpenLinkDialog(true)
  }

  function onCloseCopyDialog() {
    setOpenLinkDialog(false)
  }

  function onCopy(e) {
    navigator.clipboard.writeText(shareLink).then(
      () => {
        /* clipboard successfully set */
        alert('复制成功')
        setOpenLinkDialog(false)
      },
      () => {
        /* clipboard write failed */
        const clipboard = new Clipboard(e.target, { text: () => shareLink })
        alert('复制成功')
      }
    )
  }

  return (
    <div className="py-3.5 min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center bg-brand-background ">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <img
          src="/images/blur.jpeg"
          alt="cover"
          className="animate-pulse-slow absolute inset-auto block w-full min-h-screen object-cover"
        />
        <div className="flex flex-col items-center justify-center h-full w-full px-2 md:px-10">
          <div className="relative z-1 md:max-w-3xl w-full glass filter backdrop-blur-sm py-4 rounded-md px-2 md:px-10 flex flex-col items-center">
            <div
              onClick={() => router.back()}
              className="absolute right-4 top-4 text-white text-2xl cursor-pointer"
            >
              X
            </div>
            <h1 className="font-coiny uppercase font-bold text-3xl md:text-4xl bg-gradient-to-br  from-brand-green to-brand-blue bg-clip-text text-transparent mt-3">
              {paused ? 'Paused' : 'Whitelist Round'}
            </h1>
            <h3 className="text-sm text-pink-200 tracking-widest">
              {walletAddress
                ? walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4)
                : ''}
            </h3>
            <div className="flex flex-col md:flex-row md:space-x-14 w-full mt-10 md:mt-14">
              <div className="relative w-full">
                {/* <div className="font-coiny z-10 absolute top-2 left-2 opacity-80 filter backdrop-blur-lg text-base px-4 py-2 bg-black border border-brand-purple rounded-md flex items-center justify-center text-white font-semibold">
                  <p>
                    <span className="text-brand-pink"> {totalMinted} </span> /
                    {maxSupply}
                  </p>
                </div> */}

                <img
                  src="/images/13.png"
                  className="object-cover w-full sm:h-[280px] md:w-[250px] rounded-md"
                />
              </div>
              <div className="flex flex-col items-center w-full px-4 mt-16 md:mt-0">
                <div className="font-coiny flex items-center justify-between w-full">
                  <button
                    className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                    onClick={incrementMintAmount}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 md:h-8 md:w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                  <p className="flex items-center justify-center flex-1 grow text-center font-bold text-gray-600 text-3xl md:text-4xl">
                    {mintAmount}
                  </p>
                  <button
                    className="w-14 h-10 md:w-16 md:h-12 flex items-center justify-center text-brand-background hover:shadow-lg bg-gray-300 font-bold rounded-md"
                    onClick={decrementMintAmount}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 md:h-8 md:w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 12H6"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-pink-200 tracking-widest mt-3">
                  Max Mint Amount: {maxMintAmount}
                </p>
                <div className="border-t border-b py-4 mt-16 w-full">
                  <div className="w-full text-xl font-coiny flex items-center justify-between text-brand-yellow">
                    <p> Total </p>
                    <div className="flex items-center space-x-3">
                      <p>{ethers.utils.formatUnits(price) * mintAmount}ETH</p>
                      <span className="text-gray-400"> +GAS </span>
                    </div>
                  </div>
                </div>
                {/* Mint Button && Connect Wallet Button */}
                {walletAddress ? (
                  <button
                    className={` ${
                      paused || isMinting
                        ? 'bg-gray-900 cursor-not-allowed'
                        : 'bg-gradient-to-br from-brand-purple to-brand-pink shadow-lg hover:shadow-pink-400/50'
                    } font-coiny mt-12 w-full px-6 py-3 rounded-md text-2xl text-white  mx-4 tracking-wide uppercase`}
                    disabled={paused || isMinting}
                    onClick={publicMintHandler}
                  >
                    {isMinting ? 'Minting...' : 'Mint'}
                  </button>
                ) : (
                  <button
                    className="mt-12 w-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm px-6 py-3 rounded-md text-md text-white hover:shadow-pink-400/50 mx-4 tracking-wide uppercase"
                    onClick={connectWalletHandler}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            {status && (
              <div
                className={`border ${
                  status.success ? 'border-green-500' : 'border-brand-pink-400 '
                } rounded-md text-start h-full px-4 py-4 w-full mx-auto mt-8 md:mt-4"`}
              >
                <p className="flex flex-col space-y-2 text-white text-sm md:text-base break-words ...">
                  {status.message}
                </p>
              </div>
            )}
            {/* <button
              className="mt-12 w-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm px-6 py-3 rounded-md text-md text-white hover:shadow-pink-400/50 mx-4 tracking-wide uppercase"
              onClick={onCreateInviteLink}
            >
              Invite Friends
            </button> */}
            <div className="border-t flex flex-col items-center mt-10 py-2 w-full">
              <h3 className="text-2xl text-blue-300 uppercase mt-6">
                Contract Address
              </h3>
              <a
                href={`https://arbiscan.io/address/${config.contractAddress}#readContract`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 mt-4"
              >
                <span className="break-all ...">{config.contractAddress}</span>
              </a>
            </div>
          </div>

          {/* <div className="mt-4 z-1 md:max-w-3xl w-full glass filter backdrop-blur-sm py-4 rounded-md px-2 md:px-10">
            <div className="flex text-white">
              <div className="flex-1 text-center leading-8">Invitation address</div>
              <div className="flex-1 text-center leading-8">Invitation time</div>
            </div>
            {inviteJsonObj.map((e, i) => (
              <div className="flex text-white" key={i}>
                <div className="flex-1 text-center leading-8">{e.addr}</div>
                <div className="flex-1 text-center leading-8">{e.time}</div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
      <Dialog
        sx={{
          '& .MuiDialog-paper': {
            padding: '30px 50px',
            background: 'rgba(0, 0, 0, 0.65)'
          }
        }}
        onClose={onCloseCopyDialog}
        open={openLinkDialog}
      >
        <div className="text-white break-all">{shareLink}</div>
        <button
          className="mt-12 w-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm px-6 py-3 rounded-md text-md text-white hover:shadow-pink-400/50 tracking-wide uppercase"
          onClick={onCopy}
        >
          Copy
        </button>
      </Dialog>
    </div>
  )
}
