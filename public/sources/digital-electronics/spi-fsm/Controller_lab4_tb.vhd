----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/10/2020 12:04:05 PM
-- Design Name: 
-- Module Name: Controller_lab4_tb - Behavioral
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

entity Controller_lab4_tb is
--  Port ( );
end Controller_lab4_tb;

architecture Behavioral of Controller_lab4_tb is

begin


end Behavioral;


library IEEE;
use IEEE.std_logic_1164.all;

entity Controller_lab4_tb is
end Controller_lab4_tb;

architecture testbench of Controller_lab4_tb is
component Controller_lab4 is
PORT (	take_sample	:	in	STD_LOGIC;
		sclk			:	in	STD_LOGIC;
		shift_en : out STD_LOGIC;
		load_en : out STD_LOGIC;	
        spi_cs	: 	out STD_LOGIC);
end component;


signal take_sample 			: std_logic;
signal sclk 	: std_logic; 
signal shift_en,load_en,spi_cs	: std_logic;

begin

uut : Controller_lab4 PORT MAP(
	sclk => sclk,
    take_sample => take_sample,
    shift_en => shift_en,
    spi_cs => spi_cs,
    load_en => load_en);
    
    
    
clk_proc : process
BEGIN
	sclk <= '0';
	wait for 5 ns;
	sclk <= '1';
	wait for 5 ns;
end process clk_proc;

stim_proc: process
begin
	take_sample <= '0'; -- test transition to S3
    wait for 20 ns;
    
    take_sample <= '1';  -- test unspecified input at S3
    wait for 10 ns;
    take_sample <= '0';   -- go back to S1 from S3
    wait for 170 ns;
    
    take_sample <= '1';   --  transition to S2 from S1
    wait for 20 ns;
    
    take_sample <= '0';   --  transition to S2 from S4
    wait for 40 ns;
    
    wait;
end process stim_proc;

end testbench;