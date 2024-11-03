// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/**
 * @title MaticSwap
 * @dev A DEX contract that allows users to swap any ERC20 token for MATIC
 * using Uniswap V2 Router for price discovery and liquidity
 */
contract MaticSwap is ReentrancyGuard, Ownable {
    // Uniswap V2 Router interface
    IUniswapV2Router02 public immutable uniswapRouter;
    
    // WMATIC address on Polygon
    address public constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    
    // Minimum amount of MATIC to keep in contract for gas
    uint256 public constant MINIMUM_MATIC_RESERVE = 0.1 ether;
    
    // Events
    event TokenSwapped(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOutMatic
    );
    
    event LiquidityAdded(
        address indexed token,
        uint256 tokenAmount,
        uint256 maticAmount
    );
    
    event LiquidityRemoved(
        address indexed token,
        uint256 tokenAmount,
        uint256 maticAmount
    );

    /**
     * @dev Constructor sets the Uniswap V2 Router address and initializes Ownable
     * @param _uniswapRouter Address of Uniswap V2 Router on Polygon
     */
    constructor(address _uniswapRouter) Ownable(msg.sender) {
        require(_uniswapRouter != address(0), "Invalid router address");
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }
    
    /**
     * @dev Allows users to swap any ERC20 token for MATIC
     * @param tokenIn Address of token to swap
     * @param amountIn Amount of tokens to swap
     * @param minAmountOut Minimum amount of MATIC to receive
     * @return amountOut Amount of MATIC received
     */
    function swapTokenForMatic(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != address(0), "Invalid token address");
        require(amountIn > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve router to spend tokens
        IERC20(tokenIn).approve(address(uniswapRouter), amountIn);
        
        // Setup swap path
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = WMATIC;
        
        // Get expected amount out
        uint256[] memory amounts = uniswapRouter.getAmountsOut(amountIn, path);
        require(amounts[1] >= minAmountOut, "Insufficient output amount");
        
        // Execute swap
        amounts = uniswapRouter.swapExactTokensForETH(
            amountIn,
            minAmountOut,
            path,
            msg.sender,
            block.timestamp
        );
        
        amountOut = amounts[1];
        emit TokenSwapped(msg.sender, tokenIn, amountIn, amountOut);
        
        return amountOut;
    }
    
    /**
     * @dev Get estimated MATIC output for token input
     * @param tokenIn Address of input token
     * @param amountIn Amount of input tokens
     * @return amountOut Expected MATIC output amount
     */
    function getEstimatedMaticOutput(
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = WMATIC;
        
        uint256[] memory amounts = uniswapRouter.getAmountsOut(amountIn, path);
        return amounts[1];
    }
    
    /**
     * @dev Add liquidity to token-MATIC pair
     * @param token Address of token
     * @param tokenAmount Amount of tokens to add
     */
    function addLiquidity(
        address token,
        uint256 tokenAmount
    ) external payable nonReentrant onlyOwner {
        require(token != address(0), "Invalid token address");
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(msg.value > 0, "MATIC amount must be greater than 0");
        
        // Transfer tokens to contract
        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);
        
        // Approve router to spend tokens
        IERC20(token).approve(address(uniswapRouter), tokenAmount);
        
        // Add liquidity
        uniswapRouter.addLiquidityETH{value: msg.value}(
            token,
            tokenAmount,
            0, // Accept any amount of tokens
            0, // Accept any amount of MATIC
            owner(),
            block.timestamp
        );
        
        emit LiquidityAdded(token, tokenAmount, msg.value);
    }
    
    /**
     * @dev Remove liquidity from token-MATIC pair
     * @param token Address of token
     * @param liquidity Amount of liquidity tokens to remove
     */
    function removeLiquidity(
        address token,
        uint256 liquidity
    ) external nonReentrant onlyOwner {
        require(token != address(0), "Invalid token address");
        require(liquidity > 0, "Liquidity must be greater than 0");
        
        // Remove liquidity
        (uint256 tokenAmount, uint256 maticAmount) = uniswapRouter.removeLiquidityETH(
            token,
            liquidity,
            0, // Accept any amount of tokens
            0, // Accept any amount of MATIC
            owner(),
            block.timestamp
        );
        
        emit LiquidityRemoved(token, tokenAmount, maticAmount);
    }
    
    /**
     * @dev Withdraw MATIC from contract
     * @param amount Amount of MATIC to withdraw
     */
    function withdrawMatic(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= amount + MINIMUM_MATIC_RESERVE,
            "Insufficient MATIC balance"
        );
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Withdraw ERC20 tokens from contract
     * @param token Address of token to withdraw
     * @param amount Amount of tokens to withdraw
     */
    function withdrawToken(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).transfer(owner(), amount);
    }
    
    // Required to receive MATIC
    receive() external payable {}
}