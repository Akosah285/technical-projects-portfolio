----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/10/2020 01:19:46 PM
-- Design Name: 
-- Module Name: sampling_counter_tb - Behavioral
-- Project Name: 
-- Target Devices: 
-- Tool Versions: 
-- Description: 
-- 
-- Dependencies: 
-- 
-- Revision:
-- Revision 0.01 - File Created
-- Additional Comments:
-- 
----------------------------------------------------------------------------------


library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

-- Uncomment the following library declaration if using
-- arithmetic functions with Signed or Unsigned values
--use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx leaf cells in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity sampling_counter_tb is
end sampling_counter_tb;


architecture Behavioral of sampling_counter_tb is
component sampling_counter is
	port ( clk      : in std_logic;
           take_sample : out std_logic);
end component;

signal clk: STD_LOGIC;
signal take_sample: STD_LOGIC ;

begin
uut: sampling_counter
	port map ( clk => clk,
    		   take_sample => take_sample);
    		   
clk_proc : process
BEGIN
	clk <= '0';
	wait for 10 ns;
	clk <= '1';
	wait for 10 ns;
end process clk_proc;

--stim_proc: process
--begin
   -- wait for 30 ns;
   -- wait;
--end process stim_proc;
end Behavioral;
