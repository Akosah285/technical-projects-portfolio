----------------------------------------------------------------------------------
-- Company: 
-- Engineer: 
-- 
-- Create Date: 05/10/2020 12:40:58 PM
-- Design Name: 
-- Module Name: sampling_counter - Behavioral
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
use IEEE.NUMERIC_STD.ALL;

-- Uncomment the following library declaration if instantiating
-- any Xilinx leaf cells in this code.
--library UNISIM;
--use UNISIM.VComponents.all;

entity sampling_counter is
Port ( sclk : in std_logic;
       take_sample : out std_logic);
end sampling_counter;

architecture Behavioral of sampling_counter is
signal count : unsigned (16 downto 0) := (others => '0');
signal take_sample_i : std_logic := '0';
signal TCount : integer := 100000;

--begin
--    take_sample <= take_sample_i;
--    process(sclk)
--    begin
--        if rising_edge(sclk) then
--            if count_reset = '0' then
--                count <= count + 1;
--            else 
--                count <= "000000";
--            end if;   
--        end if;
--    end process;

--    process (count)
--    begin
--        if count = 50 then
--            count_reset <= '1';
--            take_sample_i <= '1';
--        else
--            count_reset <= '0'; 
--            take_sample_i <= '0'; 
--        end if;
--    end process; 
begin
    process(sclk) 
    begin
        if rising_edge(sclk) then
            if (count = TCount) then
                take_sample <= '1';
                count <= (others => '0');
            else
                count <= count + 1;
            end if;
        end if;
    end process;
end Behavioral;
