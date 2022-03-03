import {TokenBought, TokenSold} from "../generated/Vendor/Vendor"
import {VendingMachineAccountStatus} from "../generated/schema"

export function handleTokenBought(event: TokenBought): void {
    const from = event.transaction.from.toHex()
    let entity = VendingMachineAccountStatus.load(from)

    if (!entity) {
        entity = new VendingMachineAccountStatus(from)
        entity.address = event.params.buyer
    }
    entity.amountOfEthSold = entity.amountOfEthSold.plus(event.params.amountOfEth)
    entity.amountOfBgcBought = entity.amountOfBgcBought.plus(event.params.amountOfBugCoin)
    entity.save()
}

export function handleTokenSold(event: TokenSold): void {
    const from = event.transaction.from.toHex()
    let entity = VendingMachineAccountStatus.load(from)

    if (!entity) {
        entity = new VendingMachineAccountStatus(from)
        entity.address = event.params.seller
    }
    entity.amountOfEthBought = entity.amountOfEthBought.plus(event.params.amountOfEth)
    entity.amountOfBgcSold = entity.amountOfBgcSold.plus(event.params.amountOfBugCoin)
    entity.save()
}
