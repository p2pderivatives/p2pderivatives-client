import * as cfdjs from 'cfd-js'
import { Utxo } from '../models/Utxo'

export function createKeyPair() {
  const reqJson: cfdjs.CreateKeyPairRequest = {
    wif: false,
  }
  return cfdjs.CreateKeyPair(reqJson)
}

export function getPubkeyFromPrivkey(privkey: string) {
  const reqPrivKey = {
    privkey,
    isCompressed: true,
  }

  return cfdjs.GetPubkeyFromPrivkey(reqPrivKey).pubkey
}

export function getPrivkeyFromWif(wif: string) {
  const req = {
    wif,
  }

  return cfdjs.GetPrivkeyFromWif(req).hex
}

export function decodeRawTransaction(rawTransaction: string) {
  const reqJson: cfdjs.DecodeRawTransactionRequest = {
    hex: rawTransaction,
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

export function selectUtxosForAmount(amount: number, utxos: Utxo[]): Utxo[] {
  const utxosData: cfdjs.UtxoJsonData[] = utxos.map(utxoToUtxoJson)
  const utxoIndex = getUtxoIndex(utxos)
  const reqJson: cfdjs.SelectUtxosRequest = {
    utxos: utxosData,
    targetAmount: BigInt(amount),
  }

  const utxosOut = cfdjs.SelectUtxos(reqJson).utxos

  const utxoResult = utxosOut.map(utxo => {
    const indexer = utxoIndexer(utxo)
    return utxoIndex[indexer]
  })

  return utxoResult
}
