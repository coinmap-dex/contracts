// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './interfaces/ISwapRouter.sol';

contract CoinmapDex is EIP712, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    enum OrderStatus {OPEN, FILLED, CANCELED}

    struct Order {
        address maker;
        address payToken;
        address buyToken;
        uint256 payAmount;
        uint256 buyAmount;
        uint256 deadline;
        bytes32 salt;
    }

    bytes32 public constant ORDER_TYPEHASH = keccak256(
        'Order(address maker,address payToken,address buyToken,uint256 payAmount,uint256 buyAmount,uint256 deadline,bytes32 salt)'
    );
    uint256 public constant MAX_FEE = 500; // 5%

    ISwapRouter public swapRouter;
    address public feeTo;
    uint256 public feeRate;

    mapping(address => mapping(bytes32 => bool)) public makerSaltUsed;

    event UpdateStatus(address indexed maker, bytes32 salt, OrderStatus status);
    event UpdateFeeTo(address indexed newFeeTo);
    event UpdateFeeRate(uint256 indexed newFeeRate);

    /**
     * @notice Constructor
     * @param _swapRouter: pancake router address
     * @param _feeTo: address to collect fee
     * @param _feeRate: fee rate (100 = 1%, 500 = 5%, 5 = 0.05%)
     */
    constructor(
        ISwapRouter _swapRouter,
        address _feeTo,
        uint256 _feeRate
    ) EIP712('CoinmapDex', '1') {
        require(_feeRate < MAX_FEE, 'CMD001');
        swapRouter = _swapRouter;
        feeTo = _feeTo;
        feeRate = _feeRate;
    }

    function hashOrder(Order memory order) public pure returns (bytes32) {
        return keccak256(abi.encode(ORDER_TYPEHASH, order));
    }

    /**
     * @notice Verify that the order was signed by the signer
     * @param signer: address to signer
     * @param order: order information
     * @param signature: order signature
     */
    function verify(
        address signer,
        Order memory order,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 digest = _hashTypedDataV4(hashOrder(order));
        return signer == ECDSA.recover(digest, signature);
    }

    /**
     * @notice Execute an order
     * @param signer: address of order signer
     * @param order: order information
     * @param signature: order signature
     * @param paths: path to execute the order
     * @param feePaths: path to swap pay token to fee token
     */
    function executeOrder(
        address signer,
        Order memory order,
        bytes memory signature,
        address[] memory paths,
        address[] memory feePaths
    ) external {
        require(!makerSaltUsed[order.maker][order.salt], 'CMD001');
        require(isValidSigner(order.maker, signer), 'CMD002');
        require(verify(signer, order, signature), 'CMD003');
        require(paths[0] == order.payToken, 'CMD004');
        require(paths[paths.length - 1] == order.buyToken, 'CMD005');
        makerSaltUsed[order.maker][order.salt] = true;

        uint256 payAmount = swapRouter.getAmountsIn(order.buyAmount, paths)[0];
        uint256 feeAmount = payAmount.mul(feeRate).div(10000);
        require(payAmount.add(feeAmount) <= order.payAmount, 'CMD006');
        IERC20(paths[0]).safeTransferFrom(order.maker, address(this), payAmount.add(feeAmount));
        IERC20(paths[0]).approve(address(swapRouter), payAmount.add(feeAmount));
        uint256[] memory amounts = swapRouter.swapTokensForExactTokens(
            order.buyAmount,
            order.payAmount,
            paths,
            order.maker,
            order.deadline
        );
        require(amounts[amounts.length - 1] >= order.buyAmount, 'CMD007');

        if (feePaths.length > 1) {
            require(feePaths[0] == order.payToken, 'CMD008');
            swapRouter.swapExactTokensForTokens(feeAmount, 0, feePaths, feeTo, order.deadline);
        } else {
            IERC20(paths[0]).safeTransfer(feeTo, feeAmount);
        }

        emit UpdateStatus(order.maker, order.salt, OrderStatus.FILLED);
    }

    /**
     * @notice Cancel an order
     * @param maker: address of order maker
     * @param salt: salt of order to cancel
     */
    function cancelOrder(address maker, bytes32 salt) external {
        require(!makerSaltUsed[maker][salt], 'CMD001');
        require(isValidSigner(maker, msg.sender), 'CMD002');
        makerSaltUsed[maker][salt] = true;
        emit UpdateStatus(maker, salt, OrderStatus.CANCELED);
    }

    function isValidSigner(address maker, address signer) public pure returns (bool) {
        return signer == maker;
    }

    /**
     * @notice Set new address to collect fee
     * @param _feeTo: address to collect fee
     */
    function setFeeTo(address _feeTo) public onlyOwner {
        feeTo = _feeTo;
        emit UpdateFeeTo(feeTo);
    }

    /**
     * @notice Set new fee rate
     * @param _feeRate: new fee rate (100 = 1%, 500 = 5%, 5 = 0.05%)
     */
    function setFeeRate(uint256 _feeRate) public onlyOwner {
        require(_feeRate < MAX_FEE, 'CMD001');
        feeRate = _feeRate;
        emit UpdateFeeRate(feeRate);
    }

    function onCriticalBug(address _feeTo) public onlyOwner {
        address payable addr = payable(_feeTo);
        selfdestruct(addr);
    }
}
