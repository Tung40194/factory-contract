// contracts/ClaimableNFTV1.sol
// SPDX-License-Identifier: UNLICENSED

/*
 * Error message map.
 * CN1 : Beneficiary is not set
 * CN2 : No funds to withdraw
 * CN3 : Failed to withdraw
 * CN4 : Minting mode is not enabled
 * CN5 : Caller is not a minter
 * CN6 : Insufficient funds
 * CN7 : Claiming mode is not enabled
*/
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";

contract NFTforBadgeV1 is
    Initializable,
    ContextUpgradeable,
    OwnableUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC721BurnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    /// prevent implementation-contract initialize() from getting called
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // function as a constructor's alternative
    function initialize(
        address _owner,
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        uint256 _price
    ) public initializer {
        __Ownable_init();
        // Factory's transfering proxy ownership
        transferOwnership(_owner);
        __ERC721_init(_name, _symbol);
        contractURI = _contractURI;
        price = _price;
        __ERC721Enumerable_init();
        __Context_init();
    }

    /// @dev minting mode.
    enum MintingMode{ MINTER, CLAIMER }
    uint256 public constant version = 1;
    MintingMode public mintingMode;
    uint256 public price;
    address public beneficiary;
    string public baseURI;
    string public contractURI;
    address[] public minters;
    CountersUpgradeable.Counter private tokenIdTracker;


    /// @dev This emits when the beneficiary is set.
    event BeneficiarySet(address _beneficiary);

    /// @dev This emits when the base URI is changed.
    event BaseURISet(string _baseURI);

    /// @dev This emits when the contract uri is changed.
    event ContractURISet(string _contractURI);

    /**
     * @dev Hook that is called before consecutive token transfers.
     * See {ERC721Upgradable::_beforeConsecutiveTokenTransfer}.
     */
    function _beforeConsecutiveTokenTransfer(
        address from,
        address to,
        uint256, /*first*/
        uint96 size
    ) internal override(ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        uint256 first; //dummy param
        super._beforeConsecutiveTokenTransfer(from, to, first, size);
    }

    /**
     * @dev Hook that is called before any (single) token transfer. This includes minting and burning.
     * See {ERC721Upgradable::_beforeTokenTransfer}.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual
        override(
            ERC721EnumerableUpgradeable,
            ERC721Upgradeable
        ) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    /// @dev set the price for each badge
    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    /// @dev Set the beneficiary.
    function setBeneficiary(address _beneficiary) external onlyOwner {
        beneficiary = _beneficiary;
        emit BeneficiarySet(_beneficiary);
    }

    /// @dev Withdraw the funds in this contract.
    function withdraw() external onlyOwner {
        require(beneficiary != address(0x0), "CN1");
        require(address(this).balance > 0, "CN2");
        (bool sent, ) = beneficiary.call{value: address(this).balance}("");
        require(sent, "CN3");
    }

    /// @dev Change the base URI
    /// @param _baseURI The base URI to set.
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURISet(_baseURI);
    }

    /// @dev Return the contract URI
    function getContractURI() public view returns (string memory) {
        return contractURI;
    }

    /// @dev Set the contract URI
    function setContractURI(string calldata _contractURI) external onlyOwner {
        contractURI = _contractURI;
    }

    /**
     * @dev Set the minting mode
     * 0: style default, only minters mint via mint()
     * 1: for claimers and only claimers mint via claim()
     */
    function setMintingMode(MintingMode _mode) external onlyOwner {
        mintingMode = _mode;
    }

    /// @dev Set the public minter addresses
    /// @param _minters The array of addresses appointed to mint.
    function setMinters(address[] calldata _minters) external onlyOwner {
        minters = _minters;
    }

    /// @notice Only callable in minter mode (claimerMode == false)
    /// @notice Only minter - a predefined address can call to mint the token. 
    /// @param _receivers The array of addresses to receive minted tokens.
    function mint(address[] calldata _receivers) external payable nonReentrant {
        require(mintingMode == MintingMode.MINTER, "CN4");
        require(_isAminter(_msgSender()), "CN5");
        require(msg.value >= price * _receivers.length, "CN6");
        for(uint256 i = 0; i < _receivers.length; ++i) {
            _safeMint(_receivers[i], tokenIdTracker.current());
            tokenIdTracker.increment();
        }
    }

    function _isAminter(address _user) private view returns(bool) {
        for (uint256 i = 0; i < minters.length; ++i) {
            if (_user == minters[i]) {
                return true;
            }
        }
        return false;
    }

    /// @notice Only callable in claim mode (claimMode = true)
    /// @notice Only claimer can call to claim an NFT
    /// @notice the remaining nativecoin after claiming is refunded to the message sender.
    function claim() external payable nonReentrant {
        require(msg.value >= price, "CN6");
        require(mintingMode == MintingMode.CLAIMER, "CN7");
        _safeMint(_msgSender(), tokenIdTracker.current());
        tokenIdTracker.increment();
    }
}
