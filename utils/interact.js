import contractAbi from '../constract/nft'
import { ethers } from 'ethers'
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const whitelist = require('../scripts/whitelist.js')

// const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL)
const web3 = createAlchemyWeb3(
  'https://arb-mainnet.g.alchemy.com/v2/mfq7qHTeIDhpxaAlwCV7CwkqZIFiBdei'
)

import { config } from '../dapp.config'

const nftContract = new web3.eth.Contract(contractAbi, config.contractAddress)

// const nftContract = new ethers.providers.Web3Provider(window.ethereum)
// Calculate merkle root from the whitelist array
const leafNodes = whitelist.map((addr) => keccak256(addr))
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
const root = merkleTree.getRoot()

export const getTotalMinted = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMinteState = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )
  const mintState = await contract.mintingOpen()
  return mintState
}

export const gettMintAmount = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )
  const mintState = await contract.canMintAmount(
    window.ethereum.selectedAddress,
    1
  )
  return mintState
}

export const getListMinteState = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )
  const mintState = await contract.onlyAllowlistMode()
  return mintState
}

export const getPrice = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )
  const mintState = await contract.getPrice(1)
  return mintState
}

export const getCanMinteAmount = async () => {
  const totalMinted = await nftContract.methods.totalSupply().call()
  return totalMinted
}

export const getMaxSupply = async () => {
  // const provider = new ethers.providers.Web3Provider(window.ethereum)
  // const contract = new ethers.Contract(
  //   config.contractAddress,
  //   contractAbi,
  //   provider
  // )
  // const mintState = await contract.maxSupply()
  // return mintState
}

export const isPausedState = async () => {
  const paused = await nftContract.methods.paused().call()
  return paused
}

export const isPublicSaleState = async () => {
  const publicSale = await nftContract.methods.publicM().call()
  return publicSale
}

export const isPreSaleState = async () => {
  const preSale = await nftContract.methods.presaleM().call()
  return preSale
}

export const listMint = async (mintAmount = 1, price) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  provider = provider
    .getSigner(window.ethereum.selectedAddress)
    .connectUnchecked()
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )

  const leaf = keccak256(window.ethereum.selectedAddress)
  const proof = merkleTree.getHexProof(leaf)

  // Verify Merkle Proof
  const isValid = merkleTree.verify(proof, leaf, root)

  if (!isValid) {
    return {
      success: false,
      status: 'Invalid Merkle Proof - You are not on the whitelist'
    }
  }

  try {
    const txHash = await contract.mintToMultipleAL(
      window.ethereum.selectedAddress,
      mintAmount,
      proof,
      {
        gasLimit: '990000',
        value: mintAmount * price
      }
    )
    return {
      success: true,
      status: (
        <a
          href={`https://goerli.arbiscan.io/tx/${txHash.hash}`}
          target="_blank"
        >
          <p>✅ Check out your transaction on:</p>
          <p>{`https://goerli.arbiscan.io/tx/${txHash.hash}`}</p>
        </a>
      )
    }
  } catch (error) {
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}

export const publicMint = async (amount, price) => {
  if (!window.ethereum.selectedAddress) {
    return {
      success: false,
      status: 'To be able to mint, you need to connect your wallet'
    }
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  provider = provider
    .getSigner(window.ethereum.selectedAddress)
    .connectUnchecked()
  const contract = new ethers.Contract(
    config.contractAddress,
    contractAbi,
    provider
  )
  try {
    const txHash = await contract.mintToMultiple(
      window.ethereum.selectedAddress,
      1,
      {
        gasLimit: '990000',
        value: amount * price
      }
    )
    return {
      success: true,
      status: (
        <a
          href={`https://goerli.arbiscan.io/tx/${txHash.hash}`}
          target="_blank"
        >
          <p>✅ Check out your transaction on:</p>
          <p>{`https://goerli.arbiscan.io/tx/${txHash.hash}`}</p>
        </a>
      )
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      status: '😞 Smth went wrong:' + error.message
    }
  }
}
