while [ true ]; do
    git commit -asm "Auto commit: `date`"
    git push origin trunk
    sleep 60
done