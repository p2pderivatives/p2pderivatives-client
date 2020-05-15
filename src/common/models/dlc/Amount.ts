// Used to convert between satoshi and bitcoin.
const ConversionFactor = 100000000

export default class Amount {
  // Holds the actual amount in satoshis
  private readonly _satoshis: number

  private constructor(satoshis: number) {
    this._satoshis = satoshis
  }

  // Create an Amount object using bitcoin unit.
  public static FromBitcoin(bitcoin: number): Amount {
    return new Amount(bitcoin * ConversionFactor)
  }

  // Create an Amount object using satoshi unit.
  public static FromSatoshis(satoshis: number): Amount {
    return new Amount(satoshis)
  }

  // Get the amount value in bitcoin.
  public GetBitcoinAmount(): number {
    return this._satoshis * ConversionFactor
  }

  // Get the amount value in satoshi.
  public GetSatoshiAmount(): number {
    return this._satoshis
  }

  // Return a new Amount object with value increased by the given amount of
  // satoshi.
  public AddSatoshis(satoshis: number): Amount {
    return new Amount(this._satoshis + satoshis)
  }

  // Return a new Amount object with value increased by the given amount of
  // bitcoin.
  public AddBitcoins(bitcoins: number): Amount {
    return new Amount(this._satoshis + bitcoins * ConversionFactor)
  }

  // Return a new Amount object with value increased by the given amount.
  public AddAmount(amount: Amount): Amount {
    return new Amount(this._satoshis + amount._satoshis)
  }

  // Returns the difference between the amount of satoshi in this object and
  // the amount of satoshi of the given object.
  public CompareWith(amount: Amount): number {
    return this._satoshis - amount._satoshis
  }
}
