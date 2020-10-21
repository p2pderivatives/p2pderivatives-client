import * as cfdjs from 'cfd-js'
import { Utxo } from '../models/Utxo'

export function createSchnorrKeyPair(): {
  privkey: string
  pubkey: string
} {
  const reqJson: cfdjs.CreateKeyPairRequest = {
    wif: false,
  }
  const keyPair = cfdjs.CreateKeyPair(reqJson)
  const pubkey = cfdjs.GetSchnorrPubkeyFromPrivkey({
    privkey: keyPair.privkey,
  }).pubkey

  return { privkey: keyPair.privkey, pubkey }
}

export function getPubkeyFromPrivkey(privkey: string): string {
  const reqJson = {
    privkey,
    isCompressed: true,
  }

  return cfdjs.GetPubkeyFromPrivkey(reqJson).pubkey
}

export function getPrivkeyFromWif(wif: string): string {
  const req = {
    wif,
  }

  return cfdjs.GetPrivkeyFromWif(req).hex
}

export function decodeRawTransaction(
  rawTransaction: string,
  network: string
): cfdjs.DecodeRawTransactionResponse {
  const reqJson: cfdjs.DecodeRawTransactionRequest = {
    hex: rawTransaction,
    network,
  }

  return cfdjs.DecodeRawTransaction(reqJson)
}

function utxoToUtxoJson(utxo: Utxo): cfdjs.UtxoJsonData {
  return {
    txid: utxo.txid,
    amount: BigInt(utxo.amount),
    vout: utxo.vout,
  }
}

function utxoIndexer(utxo: { txid: string; vout: number }): string {
  return utxo.txid + utxo.vout
}

interface UtxoIndex {
  [index: string]: Utxo
}

function getUtxoIndex(utxos: Utxo[]): UtxoIndex {
  const utxoIndex: UtxoIndex = {}
  utxos.forEach(utxo => {
    const indexer = utxoIndexer(utxo)
    return (utxoIndex[indexer] = utxo)
  })
  return utxoIndex
}

export function selectUtxosForAmount(
  amount: number,
  utxos: Utxo[],
  feeRate?: number
): Utxo[] {
  const utxosData: cfdjs.UtxoJsonData[] = utxos.map(utxoToUtxoJson)
  const utxoIndex = getUtxoIndex(utxos)
  const reqJson: cfdjs.SelectUtxosRequest = {
    utxos: utxosData,
    targetAmount: BigInt(amount),
    feeInfo: {
      feeRate: feeRate,
    },
  }

  const utxosOut = cfdjs.SelectUtxos(reqJson).utxos

  const utxoResult = utxosOut.map(utxo => {
    const indexer = utxoIndexer(utxo)
    return utxoIndex[indexer]
  })

  return utxoResult
}

export function getScriptForAddress(address: string): string {
  const req = { address }
  return cfdjs.GetAddressInfo(req).lockingScript
}
