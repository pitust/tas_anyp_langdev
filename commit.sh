while [ true ]; do
    git commit -asm "Auto commit: `date`"
    git push origin trunk
    sleep 10
done