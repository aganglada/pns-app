import subDomainRegistrarContract from './contracts/subDomainRegistrarContract.json'
import { getProvider } from '@pnsdomains/ui'
import { Contract, utils } from 'ethers'
import domains from '../constants/domains.json'

let subDomainRegistrars = {}

const defaultAddress = '0xa05E4DCC5eaf37fE060F932698BaeE13C4d213ac'

const getSubDomainRegistrar = async address => {
  const provider = await getProvider()
  function instantiateContract(address) {
    const contract = new Contract(address, subDomainRegistrarContract, provider)
    subDomainRegistrars[address] = contract
    return contract
  }

  if (address) {
    if (subDomainRegistrars[address]) {
      return subDomainRegistrars[address]
    } else {
      subDomainRegistrars[address] = instantiateContract(address)
      return subDomainRegistrars[address]
    }
  }

  if (subDomainRegistrars[defaultAddress]) {
    return subDomainRegistrars[defaultAddress]
  } else {
    subDomainRegistrars[defaultAddress] = instantiateContract(defaultAddress)
    return subDomainRegistrars[defaultAddress]
  }
}

export const query = async (domain, label, address = defaultAddress) => {
  const Registrar = await getSubDomainRegistrar(address)
  ///const web3 = await getWeb3()
  const {
    domain: labelName,
    price,
    referralFeePPM,
    rent
  } = await Registrar.query(
    utils.solidityKeccak256(['string'], [domain]),
    label
  )

  return {
    label,
    domain,
    price,
    rent,
    referralFeePPM,
    available: labelName !== ''
  }
}

export const queryAll = async label => {
  return domains.map(domain => {
    if (domain.registrar) {
      return query(domain.name, label, domain.registrar)
    }
    return query(domain.name, label)
  })
}

// async function test() {
//   // const node = await query('gimmethe', 'awesome')
//   // console.log(node)
//   const nodes = await queryAll('helloooo12345')
//   nodes.map(promise =>
//     promise.then(node => node.forEach(e => console.log(e.toString())))
//   )
// }

// test()
